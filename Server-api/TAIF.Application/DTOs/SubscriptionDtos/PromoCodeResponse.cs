namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record PromoCodeResponse(
        Guid Id,
        string Code,
        string? Description,
        decimal DiscountPercent,
        int? MaxUses,
        int UsedCount,
        int? MaxUsesPerUser,
        DateTime? ExpiresAt,
        bool IsActive,
        List<Guid>? ApplicablePlanIds,
        DateTime CreatedAt
    );
}
