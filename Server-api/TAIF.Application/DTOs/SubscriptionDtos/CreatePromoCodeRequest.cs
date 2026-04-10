using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record CreatePromoCodeRequest(
        [Required, MaxLength(50)] string Code,
        [MaxLength(200)] string? Description,
        [Required, Range(0.01, 100)] decimal DiscountPercent,
        int? MaxUses,
        int? MaxUsesPerUser,
        DateTime? ExpiresAt,
        List<Guid>? ApplicablePlanIds
    );
}
