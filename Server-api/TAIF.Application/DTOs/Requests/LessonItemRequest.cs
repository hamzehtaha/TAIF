using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record LessonItemRequest
    {
        [Required(ErrorMessage = "Lesson item name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "URL is required.")]
        [Url(ErrorMessage = "URL must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "URL must not exceed 2048 characters.")]
        public string URL { get; set; } = null!;

        [Required(ErrorMessage = "Content is required.")]
        public string Content { get; set; } = null!;

        [Range(0, int.MaxValue, ErrorMessage = "Type must be a valid non-negative integer.")]
        public int Type { get; set; }

        [Required(ErrorMessage = "Lesson ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson ID must not be an empty GUID.")]
        public Guid LessonId { get; set; }
    }
}