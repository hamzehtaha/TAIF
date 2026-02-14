namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathCourseDTO
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }

        // Course details
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public string? CourseDescription { get; set; }
        public string? CoursePhoto { get; set; }
        public double CourseDurationInSeconds { get; set; }
    }
}