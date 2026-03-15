using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateInterestTagMappingRequest
    {
        [Required(ErrorMessage = "Interest ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Interest ID must not be an empty GUID.")]
        public Guid InterestId { get; set; }

        [Required(ErrorMessage = "Tag ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Tag ID must not be an empty GUID.")]
        public Guid TagId { get; set; }

        [Range(0.0, 1.0, ErrorMessage = "Weight must be between 0.0 and 1.0.")]
        public double Weight { get; set; } = 0.5;
    }
}
