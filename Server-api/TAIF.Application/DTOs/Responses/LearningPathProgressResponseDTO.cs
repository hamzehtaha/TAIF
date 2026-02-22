namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathProgressResponseDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public double DurationInSeconds { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime EnrolledAt { get; set; }
        public double CompletedDuration { get; set; }
        public Guid? CurrentSectionId { get; set; }
        public Guid? CurrentCourseId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        public List<LearningPathSectionProgressDTO> Sections { get; set; } = new();
    }
}