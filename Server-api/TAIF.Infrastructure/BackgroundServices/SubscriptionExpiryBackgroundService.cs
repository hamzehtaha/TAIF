using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Runs hourly to expire overdue subscriptions and send 7-day warning emails.
    /// Uses IServiceScopeFactory because ISubscriptionService is scoped.
    /// </summary>
    public class SubscriptionExpiryBackgroundService : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubscriptionExpiryBackgroundService> _logger;

        public SubscriptionExpiryBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<SubscriptionExpiryBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SubscriptionExpiryBackgroundService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                await RunCycleAsync(stoppingToken);
                await Task.Delay(Interval, stoppingToken);
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
