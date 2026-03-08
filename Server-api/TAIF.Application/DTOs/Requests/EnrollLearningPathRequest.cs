using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record EnrollLearningPathRequest
    {
        [Required(ErrorMessage = "Learning path ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Learning path ID must not be an empty GUID.")]
        public Guid LearningPathId { get; set; }
    }
}