using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs
{
    public class LessonRequest
    {
        public string Title { get; set; } = null!;
        public string URL { get; set; } = null!;
        public Guid CourseId { get; set; }
        public string? Photo { get; set; }

    }
}