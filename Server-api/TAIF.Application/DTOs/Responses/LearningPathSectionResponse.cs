namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathSectionResponse
    {
        public Guid Id { get; set; }
        public Guid LearningPathId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Order { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
