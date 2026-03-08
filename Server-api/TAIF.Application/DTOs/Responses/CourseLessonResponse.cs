namespace TAIF.Application.DTOs.Responses
{
    public class CourseLessonResponse
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public Guid LessonId { get; set; }
        public int Order { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
