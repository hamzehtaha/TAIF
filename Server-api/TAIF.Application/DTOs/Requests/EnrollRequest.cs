using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record EnrollRequest
    {
        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }
    }
}
