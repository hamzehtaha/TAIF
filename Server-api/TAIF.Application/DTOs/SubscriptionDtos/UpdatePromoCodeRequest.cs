using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record UpdatePromoCodeRequest(
        [MaxLength(200)] string? Description,
        [Range(0.01, 100)] decimal? DiscountPercent,
        int? MaxUses,
        int? MaxUsesPerUser,
        DateTime? ExpiresAt,
        bool? IsActive,
        List<Guid>? ApplicablePlanIds
    );
}
