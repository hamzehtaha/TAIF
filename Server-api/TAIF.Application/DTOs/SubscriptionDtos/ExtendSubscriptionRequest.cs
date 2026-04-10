using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.SubscriptionDtos
{
    public record ExtendSubscriptionRequest([Range(1, 3650)] int DaysToAdd);
}
