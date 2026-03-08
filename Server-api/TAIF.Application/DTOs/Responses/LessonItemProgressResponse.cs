namespace TAIF.Application.DTOs.Responses
{
    public class LessonItemProgressResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid LessonItemId { get; set; }
        public Guid CourseID { get; set; }
        public Guid LessonID { get; set; }
        public bool IsCompleted { get; set; }
        public double CompletedDurationInSeconds { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? OrganizationId { get; set; }
    }
}
