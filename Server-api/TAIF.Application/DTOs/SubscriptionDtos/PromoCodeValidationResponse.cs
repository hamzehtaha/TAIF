namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record PromoCodeValidationResponse(
        bool IsValid,
        string? ErrorMessage,
        decimal? DiscountAmount,
        decimal? FinalPrice
    );
}
