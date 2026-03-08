using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public class UpdateLastLessonItemRequest
    {
        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Lesson item ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson item ID must not be an empty GUID.")]
        public Guid LessonItemId { get; set; }
    }
}