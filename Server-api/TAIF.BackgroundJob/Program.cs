using Microsoft.EntityFrameworkCore;
using Serilog;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.BackgroundJob;
using TAIF.Infrastructure.Data;
using TAIF.Infrastructure.Repositories;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/job-log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14)
    .CreateLogger();

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSerilog();

var provider = builder.Configuration["Database:Provider"];

builder.Services.AddDbContext<TaifDbContext>(options =>
{
    switch (provider)
    {
        case "Postgres":
            options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"));
            break;
        case "SqlServer":
        default:
            options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer"));
            break;
    }
});

builder.Services.AddScoped<IJobRepository, JobRepository>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddHostedService<BackgroundJobProcessor>();

var host = builder.Build();

Log.Information("TAIF Background Job Server starting...");

host.Run();
