using System.ComponentModel.DataAnnotations;
using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record SubscribeToPlanRequest(
        Guid PlanId,
        BillingCycle BillingCycle,
        [MaxLength(100)] string? PromoCode = null,
        bool AutoRenew = true
    );
}
