using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    /// <summary>Admin-only: manually assign a plan to a user (no payment charged).</summary>
    public record AdminAssignPlanRequest(
        Guid UserId,
        Guid PlanId,
        BillingCycle BillingCycle,
        bool AutoRenew = false
    );
}
