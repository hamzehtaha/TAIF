using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record RecordBehaviorEventRequest
    {
        [Required(ErrorMessage = "User ID is required.")]
        [NonEmptyGuid(ErrorMessage = "User ID must not be an empty GUID.")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Event type is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Event type must be between 1 and 100 characters.")]
        public string EventType { get; set; } = null!;
    }
}
