namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathProgressResponseDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public double DurationInSeconds { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Progress Info
        public DateTime EnrolledAt { get; set; }
        public double CompletedDuration { get; set; }
        public Guid? CurrentSectionId { get; set; }
        public Guid? CurrentCourseId { get; set; }
        
        // Sections with progress
        public List<LearningPathSectionProgressDTO> Sections { get; set; } = new();
    }
}