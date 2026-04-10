using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record SetCurrencyRateRequest(
        [Range(0.000001, 999999, ErrorMessage = "Rate must be a positive number.")]
        decimal RateToUsd
    );
}
