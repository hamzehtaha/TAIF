namespace TAIF.Application.DTOs.Responses
{
    public class LessonResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid? InstructorId { get; set; }
        public InstructorResponse? Instructor { get; set; }
        public Guid? CourseId { get; set; }
        public int Order { get; set; }
        public double TotalDurationInSeconds { get; set; }
        public double Duration => TotalDurationInSeconds;
        public int TotalLessonItems { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
