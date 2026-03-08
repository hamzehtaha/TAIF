namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathCourseResponse
    {
        public Guid Id { get; set; }
        public Guid LearningPathSectionId { get; set; }
        public Guid CourseId { get; set; }
        public int Order { get; set; }
        public bool IsRequired { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
