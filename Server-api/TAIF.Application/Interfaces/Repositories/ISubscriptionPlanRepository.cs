using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ISubscriptionPlanRepository : IRepository<SubscriptionPlan>
    {
        Task<SubscriptionPlan?> GetWithFeaturesAsync(Guid id);
        Task<List<SubscriptionPlan>> GetPublicPlansAsync();
        Task<SubscriptionPlan?> GetFreePlanAsync();
    }
}
