namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CreatorId { get; set; }
        public int TotalEnrolled { get; set; }
        public double DurationInSeconds { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
