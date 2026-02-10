using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateLessonRequest
    {
        [Required]
        public string Title { get; set; } = null!;
        [Required]
        public string URL { get; set; } = null!;
        [Required]
        public Guid CourseId { get; set; }
        public string? Photo { get; set; }
    }
}
