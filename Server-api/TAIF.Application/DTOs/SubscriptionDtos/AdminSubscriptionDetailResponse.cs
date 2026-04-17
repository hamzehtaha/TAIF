using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record AdminSubscriptionDetailResponse(
        Guid Id,
        Guid UserId,
        string UserEmail,
        string UserName,
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
        DateTime? CancelledAt,
        string? CancellationReason,
        List<PaymentHistoryItem> Payments
    );

    public record PaymentHistoryItem(
        Guid Id,
        decimal Amount,
        string Currency,
        PaymentStatus Status,
        string GatewayName,
        string? GatewayTransactionId,
        DateTime? PaidAt,
        string? FailureReason,
        DateTime CreatedAt
    );
}
