using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonRequest
    {
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 300 characters.")]
        public string? Title { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Url(ErrorMessage = "Photo must be a valid URL.")]
        [MinLength(1, ErrorMessage = "Photo URL cannot be an empty string. Send null to remove it.")]
        [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
        public string? Photo { get; set; }

        public Guid? InstructorId { get; set; }
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can change this
    }
}
