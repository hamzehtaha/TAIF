using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateLessonRequest
    {
        [Required]
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        
        // Instructor information (embedded, not user reference)
        public string? InstructorName { get; set; }
        public string? InstructorBio { get; set; }
        public string? InstructorPhoto { get; set; }
    }
}
