using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateCourseRequest
    {
        [Required(ErrorMessage = "Course name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Course name must be between 2 and 200 characters.")]
        public string Name { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Url(ErrorMessage = "Photo must be a valid URL.")]
        [MinLength(1, ErrorMessage = "Photo URL cannot be an empty string. Send null to remove it.")]
        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        [NonEmptyGuid(ErrorMessage = "Category ID must not be an empty GUID.")]
        public Guid CategoryId { get; set; }

        [Required(ErrorMessage = "At least one tag is required.")]
        [MinLength(1, ErrorMessage = "At least one tag must be provided.")]
        public List<Guid> Tags { get; set; } = new();

        /// <summary>Whether this course is free to access without a paid subscription.</summary>
        public bool IsFree { get; set; } = false;

        /// <summary>Optional date until which the course is free. After this date it becomes paid automatically.</summary>
        public DateTime? FreeUntil { get; set; }
    }
}