using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record ValidatePromoCodeRequest(
        string Code,
        Guid PlanId,
        BillingCycle BillingCycle
    );
}
