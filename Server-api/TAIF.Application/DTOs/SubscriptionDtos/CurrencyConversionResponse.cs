namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record CurrencyConversionResponse(
        string FromCurrency,
        string ToCurrency,
        decimal ExchangeRate,
        decimal OriginalMonthlyPrice,
        decimal ConvertedMonthlyPrice,
        decimal OriginalYearlyPrice,
        decimal ConvertedYearlyPrice
    );
}
