using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.Requests
{
    public record LessonRequest
    {
        public string Title { get; set; } = null!;
        public string URL { get; set; } = null!;
        public Guid CourseId { get; set; }
        public string? Photo { get; set; }

    }
}