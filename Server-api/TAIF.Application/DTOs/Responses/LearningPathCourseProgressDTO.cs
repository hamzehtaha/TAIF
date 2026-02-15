namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathCourseProgressDTO
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public string? CourseDescription { get; set; }
        public string? CoursePhoto { get; set; }
        public double CourseDurationInSeconds { get; set; }
        public bool IsEnrolled { get; set; }
        public bool IsCurrentCourse { get; set; }
    }
}