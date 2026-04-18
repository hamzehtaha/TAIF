using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Periodic background service that handles maintenance tasks:
    /// - Cleans up expired verification tokens
    /// - Purges old soft-deleted records
    /// Configurable via BackgroundJobs:Maintenance in appsettings.
    /// </summary>
    public class MaintenanceBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<MaintenanceBackgroundService> _logger;
        private readonly JobOptions _jobOptions;

        public MaintenanceBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<MaintenanceBackgroundService> logger,
            IOptions<BackgroundJobsOptions> options)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _jobOptions = options.Value.Maintenance;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_jobOptions.Enabled)
            {
                _logger.LogInformation("MaintenanceBackgroundService is disabled by configuration");
                return;
            }

            _logger.LogInformation("MaintenanceBackgroundService started. Interval: {Interval}s, InitialDelay: {Delay}s",
                _jobOptions.IntervalSeconds, _jobOptions.InitialDelaySeconds);

            await Task.Delay(_jobOptions.InitialDelay, stoppingToken);

            using var timer = new PeriodicTimer(_jobOptions.Interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunMaintenanceCycleAsync(stoppingToken);
            }

            _logger.LogInformation("MaintenanceBackgroundService stopped");
        }

        private async Task RunMaintenanceCycleAsync(CancellationToken ct)
        {
            // --- Clean up expired verification tokens ---
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var userRepo = scope.ServiceProvider.GetRequiredService<TAIF.Application.Interfaces.Repositories.IUserRepository>();
                var expiredUsers = await userRepo.FindAsync(
                    u => u.VerificationToken != null &&
                         u.VerificationTokenExpiresAt != null &&
                         u.VerificationTokenExpiresAt < DateTime.UtcNow);

                foreach (var user in expiredUsers)
                {
                    user.VerificationToken = null;
                    user.VerificationTokenExpiresAt = null;
                    user.VerificationChannel = null;
                }

                if (expiredUsers.Any())
                {
                    await userRepo.SaveChangesAsync();
                    _logger.LogInformation("Cleaned up {Count} expired verification tokens", expiredUsers.Count);
                }
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error cleaning up expired verification tokens");
            }
        }
    }
}
