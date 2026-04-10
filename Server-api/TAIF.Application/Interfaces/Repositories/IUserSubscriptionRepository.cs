using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IUserSubscriptionRepository : IRepository<UserSubscription>
    {
        /// <summary>Returns all subscriptions with Plan navigation loaded. Optionally filtered by status.</summary>
        Task<List<UserSubscription>> GetAllWithPlansAsync(SubscriptionStatus? status = null);

        /// <summary>
        /// Returns the subscription that is currently granting access:
        /// Status is Active, Trialing, or Cancelled-but-EndDate-not-yet-passed.
        /// Includes Plan and Features.
        /// </summary>
        Task<UserSubscription?> GetActiveByUserIdAsync(Guid userId);

        Task<List<UserSubscription>> GetHistoryByUserIdAsync(Guid userId);

        /// <summary>Returns Active/Trialing/Cancelled subscriptions whose EndDate has passed.</summary>
        Task<List<UserSubscription>> GetExpiredAsync();

        /// <summary>Returns Active subscriptions expiring within the given number of days (for warning emails).</summary>
        Task<List<UserSubscription>> GetExpiringWithinDaysAsync(int days);

        /// <summary>Returns true if the user has ever had a trial subscription for the given plan.</summary>
        Task<bool> HasUsedTrialForPlanAsync(Guid userId, Guid planId);

        /// <summary>Returns a subscription with User, Plan, and Payments loaded for admin detail view.</summary>
        Task<UserSubscription?> GetWithDetailsAsync(Guid subscriptionId);

        /// <summary>Returns count of subscriptions created within the given period.</summary>
        Task<int> GetNewSubscriptionsCountAsync(DateTime from, DateTime to);

        /// <summary>Returns count of cancellations within the given period.</summary>
        Task<int> GetCancellationsCountAsync(DateTime from, DateTime to);
    }
}
