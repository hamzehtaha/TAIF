using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateLessonRequest
    {
        [Required]
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid? InstructorId { get; set; }
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can set this
    }
}
