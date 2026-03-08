using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record SetLessonItemAsCompletedRequest
    {
        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Lesson ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson ID must not be an empty GUID.")]
        public Guid LessonID { get; set; }

        [Required(ErrorMessage = "Lesson item ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson item ID must not be an empty GUID.")]
        public Guid LessonItemId { get; set; }
    }
}
