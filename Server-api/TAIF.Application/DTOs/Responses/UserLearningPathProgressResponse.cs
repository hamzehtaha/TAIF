namespace TAIF.Application.DTOs.Responses
{
    public class UserLearningPathProgressResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid LearningPathId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public Guid? CurrentSectionId { get; set; }
        public Guid? CurrentCourseId { get; set; }
        public double CompletedDuration { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? OrganizationId { get; set; }
    }
}
