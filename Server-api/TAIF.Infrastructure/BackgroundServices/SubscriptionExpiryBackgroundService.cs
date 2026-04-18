using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Runs periodically to expire overdue subscriptions and send warning emails.
    /// Configurable via BackgroundJobs:SubscriptionExpiry in appsettings.
    /// </summary>
    public class SubscriptionExpiryBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubscriptionExpiryBackgroundService> _logger;
        private readonly JobOptions _jobOptions;

        public SubscriptionExpiryBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<SubscriptionExpiryBackgroundService> logger,
            IOptions<BackgroundJobsOptions> options)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _jobOptions = options.Value.SubscriptionExpiry;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_jobOptions.Enabled)
            {
                _logger.LogInformation("SubscriptionExpiryBackgroundService is disabled by configuration");
                return;
            }

            _logger.LogInformation("SubscriptionExpiryBackgroundService started. Interval: {Interval}s", _jobOptions.IntervalSeconds);

            if (_jobOptions.InitialDelaySeconds > 0)
                await Task.Delay(_jobOptions.InitialDelay, stoppingToken);

            using var timer = new PeriodicTimer(_jobOptions.Interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunCycleAsync(stoppingToken);
            }

            _logger.LogInformation("SubscriptionExpiryBackgroundService stopped");
        }

        private async Task RunCycleAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var subscriptionService = scope.ServiceProvider.GetRequiredService<ISubscriptionService>();

                _logger.LogDebug("Processing expired subscriptions");
                await subscriptionService.ProcessExpiredSubscriptionsAsync();

                _logger.LogDebug("Sending expiry warning emails");
                await subscriptionService.SendExpiryWarningsAsync();
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error in SubscriptionExpiryBackgroundService cycle");
            }
        }
    }
}
