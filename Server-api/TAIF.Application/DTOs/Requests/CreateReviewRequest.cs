using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateReviewRequest
    {
        [Required(ErrorMessage = "Course ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Rating is required.")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [StringLength(2000, ErrorMessage = "Comment must not exceed 2000 characters.")]
        public string? Comment { get; set; }
    }
}
