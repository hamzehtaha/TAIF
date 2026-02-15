namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathDetailsResponseDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public int TotalEnrolled { get; set; }
        public double DurationInSeconds { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsEnrolled { get; set; }
        public List<LearningPathSectionDTO> Sections { get; set; } = new();
    }
}