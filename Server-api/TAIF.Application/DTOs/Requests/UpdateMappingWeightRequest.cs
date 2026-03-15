using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateMappingWeightRequest
    {
        [Range(0.0, 1.0, ErrorMessage = "Weight must be between 0.0 and 1.0.")]
        public double Weight { get; set; }
    }
}
