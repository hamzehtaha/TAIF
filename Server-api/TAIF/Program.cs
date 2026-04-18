using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using System.Threading.RateLimiting;
using TAIF.API.Middleware;
using TAIF.API.Seeder;
using TAIF.API.Seeder.Scripts;
using TAIF.Application.DTOs.VideoDtos;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Mappings;
using TAIF.Application.Services;
using TAIF.Infrastructure.Data;
using TAIF.Infrastructure.Repositories;
using TAIF.Infrastructure.Services;
using TAIF.Application.Options;
using Microsoft.AspNetCore.ResponseCompression;

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

// --- Centralized Options ---
builder.Services.Configure<RateLimitingOptions>(builder.Configuration.GetSection(RateLimitingOptions.SectionName));
builder.Services.Configure<BackgroundJobsOptions>(builder.Configuration.GetSection(BackgroundJobsOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.Configure<FileUploadOptions>(builder.Configuration.GetSection(FileUploadOptions.SectionName));
builder.Services.Configure<CacheOptions>(builder.Configuration.GetSection(CacheOptions.SectionName));
builder.Services.Configure<RecommendationOptions>(builder.Configuration.GetSection(RecommendationOptions.SectionName));

// In-memory caching — backed by ICacheService abstraction (swap to Redis by changing registration)
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

var provider = builder.Configuration["Database:Provider"];

builder.Services.AddDbContext<TaifDbContext>(options =>
{
    switch (provider)
    {
        case "Postgres":
            options.UseNpgsql(
                builder.Configuration.GetConnectionString("Postgres"),
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null));
            break;

        case "SqlServer":
        default:
            options.UseSqlServer(
                builder.Configuration.GetConnectionString("SqlServer"),
                sqlOptions => sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null));
            break;
    }
});


builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Verification system — multi-channel, extensible
// To add SMS: implement IVerificationChannel with ChannelName="SMS" and register below
builder.Services.Configure<TAIF.Application.Options.VerificationOptions>(
    builder.Configuration.GetSection(TAIF.Application.Options.VerificationOptions.SectionName));
builder.Services.Configure<TAIF.Infrastructure.Options.EmailOptions>(
    builder.Configuration.GetSection(TAIF.Infrastructure.Options.EmailOptions.SectionName));
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.IVerificationService, TAIF.Application.Services.VerificationService>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.IVerificationTemplateProvider, TAIF.Infrastructure.Templates.DefaultVerificationTemplateProvider>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.IVerificationChannel, TAIF.Infrastructure.Channels.EmailVerificationChannel>();
// builder.Services.AddScoped<IVerificationChannel, SmsVerificationChannel>();   // future SMS
// builder.Services.AddScoped<IVerificationChannel, WhatsAppVerificationChannel>(); // future WhatsApp

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
builder.Services.AddScoped<IUserPlanService, UserPlanService>();
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

builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

builder.Services.AddScoped<IAnswerService, AnswerService>();
builder.Services.AddScoped<IAnswerRepository, AnswerRepository>();

builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<ISkillRepository, SkillRepository>();

// Subscription system
builder.Services.Configure<TAIF.Application.Options.MockPaymentOptions>(
    builder.Configuration.GetSection(TAIF.Application.Options.MockPaymentOptions.SectionName));
builder.Services.AddScoped<TAIF.Application.Interfaces.Repositories.ISubscriptionPlanRepository, TAIF.Infrastructure.Repositories.SubscriptionPlanRepository>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Repositories.IUserSubscriptionRepository, TAIF.Infrastructure.Repositories.UserSubscriptionRepository>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Repositories.IPromoCodeRepository, TAIF.Infrastructure.Repositories.PromoCodeRepository>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Repositories.ISubscriptionPaymentRepository, TAIF.Infrastructure.Repositories.SubscriptionPaymentRepository>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.ISubscriptionService, TAIF.Application.Services.SubscriptionService>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.ISubscriptionEmailService, TAIF.Infrastructure.Services.SubscriptionEmailService>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Repositories.ICurrencyRateRepository, TAIF.Infrastructure.Repositories.CurrencyRateRepository>();
builder.Services.AddScoped<TAIF.Application.Interfaces.Services.ICurrencyConversionService, TAIF.Infrastructure.Services.DbCurrencyConversionService>();

// Payment gateway: MockPaymentGateway in Development, must be replaced for Production
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<TAIF.Application.Interfaces.Payments.IPaymentGateway, TAIF.Infrastructure.Payments.MockPaymentGateway>();
}
else
{
    // TODO: Register a real payment gateway (Stripe, PayPal, etc.) for production
    // Fail fast if no real gateway is configured
    builder.Services.AddScoped<TAIF.Application.Interfaces.Payments.IPaymentGateway>(sp =>
        throw new InvalidOperationException("No production payment gateway configured. Register a real IPaymentGateway implementation."));
}

// Background jobs — all configurable via BackgroundJobs section, can be enabled/disabled individually
builder.Services.AddHostedService<TAIF.Infrastructure.BackgroundServices.SubscriptionExpiryBackgroundService>();
builder.Services.AddHostedService<TAIF.Infrastructure.BackgroundServices.MaintenanceBackgroundService>();
builder.Services.AddHostedService<TAIF.Infrastructure.BackgroundServices.StatisticsBackgroundService>();

// Video services - Mux integration with provider abstraction
builder.Services.Configure<MuxOptions>(builder.Configuration.GetSection(MuxOptions.SectionName));
builder.Services.AddHttpClient<IVideoProvider, MuxVideoProvider>();
builder.Services.AddScoped<IVideoAssetRepository, VideoAssetRepository>();
builder.Services.AddScoped<IVideoAssetService, VideoAssetService>();
builder.Services.AddScoped<IEvaluationRepository, EvaluationRepository>();
builder.Services.AddScoped<IEvaluationQuestionMappingRepository, EvaluationQuestionMappingRepository>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();


// TODO: Enable Webhook instead of long polling
// Background polling service to check video asset status every 10 seconds
// Remove this when webhooks are configured and use HandleWebhookAsync instead
builder.Services.AddHostedService<VideoAssetPollingService>();

// File storage services - Local storage for now, can be switched to S3/Azure later
// TODO: Switch to AWS S3 or Azure Blob Storage for production
builder.Services.Configure<LocalStorageOptions>(builder.Configuration.GetSection(LocalStorageOptions.SectionName));
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

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
    // Hierarchy: SuperAdmin > Admin > ContentCreator > Student
    // [Authorize] alone = any authenticated user (Student+)

    // SuperAdmin only
    options.AddPolicy("SuperAdminOnly", policy =>
        policy.RequireRole("SuperAdmin"));

    // Admin and SuperAdmin
    options.AddPolicy("AdminOrAbove", policy =>
        policy.RequireRole("SuperAdmin", "Admin"));

    // ContentCreator, Admin, and SuperAdmin
    options.AddPolicy("ContentCreatorOrAbove", policy =>
        policy.RequireRole("SuperAdmin", "Admin", "ContentCreator"));
});

builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Development: allow all origins for testing convenience
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    }
    else
    {
        // Production: restrict to configured origins
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();
        options.AddPolicy("AllowAll", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    }
});

// Response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

// Rate limiting — values from RateLimiting configuration section
var rateLimitConfig = builder.Configuration.GetSection(RateLimitingOptions.SectionName).Get<RateLimitingOptions>() ?? new RateLimitingOptions();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global rate limit for all endpoints (#43)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitConfig.Global?.PermitLimit ?? 100,
                Window = TimeSpan.FromSeconds(rateLimitConfig.Global?.WindowSeconds ?? 60),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddFixedWindowLimiter("AuthRateLimit", opt =>
    {
        opt.PermitLimit = rateLimitConfig.Auth.PermitLimit;
        opt.Window = TimeSpan.FromSeconds(rateLimitConfig.Auth.WindowSeconds);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("VerificationRateLimit", opt =>
    {
        opt.PermitLimit = rateLimitConfig.Verification.PermitLimit;
        opt.Window = TimeSpan.FromSeconds(rateLimitConfig.Verification.WindowSeconds);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

// Register Mapster mappings
MappingConfig.RegisterMappings();

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<TaifDbContext>("database");

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
                "OrganizationSeeder" => 0,
                "SkillSeeder" => 1,
                "UserSeeder" => 2,
                "RecommendationSeeder" => 3,
                "EvaluationQuestionSeeder" => 4,
                "InstructorSeeder" => 5,
                "CourseSeeder" => 6,
                "LearningPathSeeder" => 7,
                "AnswerSeeder" => 8,
                "SubscriptionPlanSeeder" => 9,
                "CurrencyRateSeeder" => 10,
                _ => 99
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
                Console.WriteLine($"? Error in {s.GetType().Name}: {ex.Message}");
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

// Auto-migrate database on startup (Development only - use migration scripts in production)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
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

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseResponseCompression();

app.UseRateLimiter();

// Serilog structured request logging
app.UseSerilogRequestLogging();

// Enable serving static files from wwwroot (for uploaded images)
app.UseStaticFiles();

// Swagger: only in Development
if (app.Environment.IsDevelopment())
{
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
}
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseMiddleware<OrganizationContextMiddleware>();
app.UseMiddleware<OrganizationScopingMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.Run();

void InjectSeeders()
{
    // Only register explicit seeders - order matters for dependencies!
    builder.Services.AddScoped<IEntitySeeder, OrganizationSeeder>();
    builder.Services.AddScoped<IEntitySeeder, SkillSeeder>();
    builder.Services.AddScoped<IEntitySeeder, UserSeeder>();
    builder.Services.AddScoped<IEntitySeeder, RecommendationSeeder>();
    builder.Services.AddScoped<IEntitySeeder, EvaluationQuestionSeeder>();
    builder.Services.AddScoped<IEntitySeeder, InstructorSeeder>();
    builder.Services.AddScoped<IEntitySeeder, CourseSeeder>();
    builder.Services.AddScoped<IEntitySeeder, LearningPathSeeder>();
    builder.Services.AddScoped<IEntitySeeder, AnswerSeeder>();
    builder.Services.AddScoped<IEntitySeeder, QuestionSeeder>();
    builder.Services.AddScoped<IEntitySeeder, SubscriptionPlanSeeder>();
    builder.Services.AddScoped<IEntitySeeder, CurrencyRateSeeder>();
}