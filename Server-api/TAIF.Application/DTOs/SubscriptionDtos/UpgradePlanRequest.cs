using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record UpgradePlanRequest(Guid NewPlanId, BillingCycle BillingCycle);
}
