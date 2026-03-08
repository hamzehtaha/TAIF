using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record LessonRequest
    {
        [Required(ErrorMessage = "Lesson title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "URL is required.")]
        [Url(ErrorMessage = "URL must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "URL must not exceed 2048 characters.")]
        public string URL { get; set; } = null!;

        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Url(ErrorMessage = "Photo must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }
    }
}