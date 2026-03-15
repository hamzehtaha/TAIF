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
        [EnumDataType(typeof(TAIF.Application.Services.BehaviorEventType), ErrorMessage = "Event type must be a valid behavior event type.")]
        public string EventType { get; set; } = null!;
    }
}
