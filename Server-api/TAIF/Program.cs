using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Reflection;
using System.Text;
using TAIF.API.Middleware;
using TAIF.API.Seeder;
using TAIF.API.Seeder.Scripts;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Infrastructure.Data;
using TAIF.Infrastructure.Repositories;

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

var provider = builder.Configuration["Database:Provider"];

builder.Services.AddDbContext<TaifDbContext>(options =>
{
    switch (provider)
    {
        case "Postgres":
            options.UseNpgsql(
                builder.Configuration.GetConnectionString("Postgres"));
            break;

        case "SqlServer":
        default:
            options.UseSqlServer(
                builder.Configuration.GetConnectionString("SqlServer"));
            break;
    }
});


builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Organization context - request scoped
builder.Services.AddScoped<TAIF.Application.Interfaces.IOrganizationContext, TAIF.Application.Services.OrganizationContext>();

// Tenant provider for automatic multi-tenancy filtering in DbContext
builder.Services.AddScoped<TAIF.Application.Interfaces.ITenantProvider, TAIF.Application.Services.TenantProvider>();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ILessonItemRepository, LessonItemRepository>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<ILessonItemProgressRepository, LessonItemProgressRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<ILessonItemService, LessonItemService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<ILessonItemProgressService, LessonItemProgressService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Recommendation engine repositories
builder.Services.AddScoped<IInterestRepository, InterestRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IInterestTagMappingRepository, InterestTagMappingRepository>();
builder.Services.AddScoped<IUserCourseBehaviorRepository, UserCourseBehaviorRepository>();

// Recommendation engine services
builder.Services.AddScoped<IInterestService, InterestService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IInterestTagMappingService, InterestTagMappingService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

builder.Services.AddScoped<IQuizSubmissionService, QuizSubmissionService>();
builder.Services.AddScoped<IQuizSubmissionRepository, QuizSubmissionRepository>();

builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();

builder.Services.AddScoped<IInstructorRepository, InstructorRepository>();
builder.Services.AddScoped<IInstructorService, InstructorService>();

builder.Services.AddScoped<ICourseStatisticsService, CourseStatisticsService>();

builder.Services.AddScoped<ILearningPathRepository, LearningPathRepository>();
builder.Services.AddScoped<ILearningPathSectionRepository, LearningPathSectionRepository>();
builder.Services.AddScoped<ILearningPathCourseRepository, LearningPathCourseRepository>();
builder.Services.AddScoped<IUserLearningPathProgressRepository, UserLearningPathProgressRepository>();

builder.Services.AddScoped<ILearningPathService, LearningPathService>();
builder.Services.AddScoped<ILearningPathSectionService, LearningPathSectionService>();
builder.Services.AddScoped<ILearningPathCourseService, LearningPathCourseService>();
builder.Services.AddScoped<IUserLearningPathProgressService, UserLearningPathProgressService>();
builder.Services.AddScoped<ILearningPathStatisticsService, LearningPathStatisticsService>();
builder.Services.AddSingleton<IAiHelperService, OllamaAiHelperService>();

builder.Services.AddScoped<IEvaluationQuestionRepository, EvaluationQuestionRepository>();
builder.Services.AddScoped<IEvaluationAnswerRepository, EvaluationAnswerRepository>();

builder.Services.AddScoped<IEvaluationQuestionService, EvaluationQuestionService>();
builder.Services.AddScoped<IEvaluationAnswerService, EvaluationAnswerService>();

builder.Services.AddScoped<IUserEvaluationRepository, UserEvaluationRepository>();
builder.Services.AddScoped<IUserEvaluationService, UserEvaluationService>();

// New M-M relationship repositories and services
builder.Services.AddScoped<ICourseLessonRepository, CourseLessonRepository>();
builder.Services.AddScoped<ICourseLessonService, CourseLessonService>();

builder.Services.AddScoped<ILessonLessonItemRepository, LessonLessonItemRepository>();
builder.Services.AddScoped<ILessonLessonItemService, LessonLessonItemService>();

// Content type repositories and services
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IContentRepository, ContentRepository>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme,
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "Paste ONLY the JWT token (without 'Bearer ')",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtBearerDefaults.AuthenticationScheme
                }
            },
            Array.Empty<string>()
        }
    });
});
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

builder.Services.AddAuthorization(options =>
{
    // SuperAdmin Only Policy (Role=0) - Can access all portals
    options.AddPolicy("SuperAdminOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.FindFirst("Role")?.Value == "0"));

    // Admin or SuperAdmin (Role=0 or 1)
    options.AddPolicy("AdminOrAbove", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1";
        }));

    // ContentCreator or above (Role=0, 1, or 2) - For content management
    options.AddPolicy("ContentCreatorOrAbove", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1" || roleValue == "2";
        }));

    // Legacy policies for backward compatibility (map to new roles)
    options.AddPolicy("SystemAdminOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.FindFirst("Role")?.Value == "0"));

    options.AddPolicy("OrgAdminOrAbove", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1";
        }));

    options.AddPolicy("InstructorOrAbove", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1" || roleValue == "2";
        }));

    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAssertion(context =>
            context.User.FindFirst("Role")?.Value == "0"));

    options.AddPolicy("InstructorOrCompanyOrAdmin", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1" || roleValue == "2";
        }));

    options.AddPolicy("InstructorOrAdmin", policy =>
        policy.RequireAssertion(context =>
        {
            var roleValue = context.User.FindFirst("Role")?.Value;
            return roleValue == "0" || roleValue == "1" || roleValue == "2";
        }));
});

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
    
    // Get fresh services from scope
    var serviceProvider = scope.ServiceProvider;
    var allSeeders = serviceProvider.GetServices<IEntitySeeder>().ToList();
    
    if (entityName == "all")
    {
        // Order seeders correctly - Organization MUST be first
        var orderedSeeders = allSeeders
            .OrderBy(s => s.GetType().Name switch
            {
                "OrganizationSeeder" => 0,          // First: seed organizations (required for user assignment)
                "UserSeeder" => 1,                  // Second: seed users (with OrganizationId)
                "RecommendationSeeder" => 2,        // Third: seed interests & tags
                "EvaluationQuestionSeeder" => 3,    // Fourth: seed evaluation questions
                "InstructorSeeder" => 4,            // Fifth: seed instructors (required by Course)
                "CourseSeeder" => 5,                // Sixth: seed courses (uses users + tags + instructors)
                "LearningPathSeeder" => 6,          // Seventh: seed learning paths (uses courses)
                _ => 99                             // Other seeders last
            })
            .ToList();
        
        foreach (var s in orderedSeeders) 
        {
            try
            {
                await s.SeedAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in {s.GetType().Name}: {ex.Message}");
                throw;
            }
        }
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

// TODO: Move  statistics update to a better place (e.g., background job, scheduled task, or manual trigger)
// Update statistics on startup - Sequential execution to ensure courses are calculated before learning paths
_ = Task.Run(async () =>
{
    using var scope = app.Services.CreateScope();
    try
    {
        // STEP 1: Update course statistics FIRST
        var courseStatisticsService = scope.ServiceProvider.GetRequiredService<ICourseStatisticsService>();
        Log.Information("Starting course statistics update on startup");
        await courseStatisticsService.UpdateAllCourseStatisticsAsync();
        Log.Information("Course statistics updated successfully on startup");

        // STEP 2: Update learning path statistics AFTER courses are done
        var learningPathStatisticsService = scope.ServiceProvider.GetRequiredService<ILearningPathStatisticsService>();
        Log.Information("Starting learning path statistics update on startup");
        await learningPathStatisticsService.UpdateAllLearningPathStatisticsAsync();
        Log.Information("Learning path statistics updated successfully on startup");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while updating statistics on startup");
    }
});

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pulse API v1");
});
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Response.Redirect("/swagger");
        return;
    }
    await next();
});
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseMiddleware<OrganizationContextMiddleware>();
app.UseMiddleware<OrganizationScopingMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.Run();

void InjectSeeders()
{
    // Only register explicit seeders - order matters for dependencies!
    builder.Services.AddScoped<IEntitySeeder, OrganizationSeeder>();
    builder.Services.AddScoped<IEntitySeeder, UserSeeder>();
    builder.Services.AddScoped<IEntitySeeder, RecommendationSeeder>();
    builder.Services.AddScoped<IEntitySeeder, EvaluationQuestionSeeder>();
    builder.Services.AddScoped<IEntitySeeder, InstructorSeeder>();
    builder.Services.AddScoped<IEntitySeeder, CourseSeeder>();
    builder.Services.AddScoped<IEntitySeeder, LearningPathSeeder>();
}