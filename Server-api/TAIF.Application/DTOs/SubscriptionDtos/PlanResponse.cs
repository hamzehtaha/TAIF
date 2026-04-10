using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record PlanResponse(
        Guid Id,
        string Name,
        string? Description,
        decimal MonthlyPrice,
        decimal YearlyPrice,
        decimal YearlyDiscountPercent,
        string Currency,
        int TrialDaysCount,
        int DisplayOrder,
        Dictionary<string, string> Features   // PlanFeatureKey.ToString() → Value
    );
}
