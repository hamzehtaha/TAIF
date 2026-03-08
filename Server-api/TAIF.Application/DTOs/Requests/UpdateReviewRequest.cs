using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateReviewRequest
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int? Rating { get; set; }

        [StringLength(2000, ErrorMessage = "Comment must not exceed 2000 characters.")]
        public string? Comment { get; set; }
    }
}
