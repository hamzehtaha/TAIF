using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Runs daily to set IsFree = false on courses whose FreeUntil date has passed.
    /// Configurable via BackgroundJobs:CourseFreeExpiry in appsettings.
    /// </summary>
    public class CourseFreeExpiryBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CourseFreeExpiryBackgroundService> _logger;
        private readonly JobOptions _jobOptions;

        public CourseFreeExpiryBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<CourseFreeExpiryBackgroundService> logger,
            IOptions<BackgroundJobsOptions> options)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _jobOptions = options.Value.CourseFreeExpiry;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_jobOptions.Enabled)
            {
                _logger.LogInformation("CourseFreeExpiryBackgroundService is disabled by configuration");
                return;
            }

            _logger.LogInformation("CourseFreeExpiryBackgroundService started. Interval: {Interval}s", _jobOptions.IntervalSeconds);

            if (_jobOptions.InitialDelaySeconds > 0)
                await Task.Delay(_jobOptions.InitialDelay, stoppingToken);

            using var timer = new PeriodicTimer(_jobOptions.Interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunCycleAsync(stoppingToken);
            }

            _logger.LogInformation("CourseFreeExpiryBackgroundService stopped");
        }

        private async Task RunCycleAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var courseRepo = scope.ServiceProvider.GetRequiredService<ICourseRepository>();

                var expired = await courseRepo.ExpireCourseFreeAccessAsync(DateTime.UtcNow);
                if (expired > 0)
                    _logger.LogInformation("CourseFreeExpiryBackgroundService: {Count} course(s) reverted to paid", expired);
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error in CourseFreeExpiryBackgroundService cycle");
            }
        }
    }
}
