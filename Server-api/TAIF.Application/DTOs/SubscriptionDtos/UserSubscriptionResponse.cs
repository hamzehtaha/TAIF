using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record UserSubscriptionResponse(
        Guid Id,
        Guid PlanId,
        string PlanName,
        SubscriptionStatus Status,
        BillingCycle BillingCycle,
        DateTime StartDate,
        DateTime? EndDate,
        bool AutoRenew,
        decimal PaidAmount,
        string Currency,
        DateTime? TrialEndsAt,
        bool IsInTrial,
        int? DaysRemaining,
        Dictionary<string, string> Features
    );
}
