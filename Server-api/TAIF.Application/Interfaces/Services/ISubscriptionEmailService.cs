using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    /// <summary>
    /// Sends transactional emails for subscription lifecycle events.
    /// Implementation lives in Infrastructure and reuses the existing SMTP (EmailOptions) setup.
    /// </summary>
    public interface ISubscriptionEmailService
    {
        Task SendSubscriptionConfirmedAsync(User user, UserSubscription subscription, SubscriptionPlan plan, CancellationToken ct = default);
        Task SendCancellationConfirmedAsync(User user, UserSubscription subscription, SubscriptionPlan plan, CancellationToken ct = default);
        Task SendExpiryWarningAsync(User user, UserSubscription subscription, SubscriptionPlan plan, int daysRemaining, CancellationToken ct = default);
        Task SendPaymentFailedAsync(User user, SubscriptionPlan plan, CancellationToken ct = default);
    }
}
