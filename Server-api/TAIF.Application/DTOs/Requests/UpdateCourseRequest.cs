using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateCourseRequest
    {
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Course name must be between 2 and 200 characters.")]
        public string? Name { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Url(ErrorMessage = "Photo must be a valid URL.")]
        [MinLength(1, ErrorMessage = "Photo URL cannot be an empty string. Send null to remove it.")]
        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }

        public Guid? CategoryId { get; set; }

        [MinLength(1, ErrorMessage = "At least one tag must be provided.")]
        public List<Guid>? Tags { get; set; }

        /// <summary>Whether this course is free to access without a paid subscription.</summary>
        public bool? IsFree { get; set; }

        /// <summary>Optional date until which the course is free. Set to null to clear.</summary>
        public DateTime? FreeUntil { get; set; }
    }
}