using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Responses
{
    public class CourseResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public List<Guid> Tags { get; set; } = new();
        public double TotalDurationInSeconds { get; set; }
        public int TotalEnrolled { get; set; }
        public int TotalLessonItems { get; set; }
        public int TotalLessons { get; set; }
        public CourseStatus Status { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
