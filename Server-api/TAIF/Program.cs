using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TAIF.API.Middleware;
using TAIF.Application.Interfaces;
using TAIF.Application.Services;
using TAIF.Infrastructure.Data;
using TAIF.Infrastructure.Repositories;
using Serilog;
using TAIF.API.Seeder;
using System.Reflection;
using Microsoft.AspNetCore.Cors.Infrastructure;


var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();

builder.Services.AddDbContext<TaifDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ILessonItemRepository, LessonItemRepository>();

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<ILessonItemService, LessonItemService>();



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

InjectSeeders();

var app = builder.Build();

if (args.Length >= 2 && args[0].Equals("seed", StringComparison.OrdinalIgnoreCase))
{
    var entityName = args[1].ToLower();
    using var scope = app.Services.CreateScope();
    var allSeeders = scope.ServiceProvider.GetServices<IEntitySeeder>();
    if (entityName == "all")
    {
        foreach (var s in allSeeders) await s.SeedAsync();
        return;
    }

    var seederToRun = allSeeders.FirstOrDefault(s =>
        s.GetType().Name.Equals($"{entityName}Seeder", StringComparison.OrdinalIgnoreCase));

    if (seederToRun == null)
    {
        Console.WriteLine($"Seeder for '{entityName}' not found.");
        return;
    }

    await seederToRun.SeedAsync();
    return;
}

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaifDbContext>();
    try
    {
        db.Database.Migrate();
        Log.Information("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while migrating the database");
    }
}

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

void InjectSeeders()
{
    var seederType = typeof(IEntitySeeder);
    var seeders = Assembly.GetAssembly(seederType)!
        .GetTypes()
        .Where(t => seederType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

    foreach (var seeder in seeders)
    {
        builder.Services.AddScoped(seederType, seeder);
    }
}