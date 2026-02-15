namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathSectionProgressDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Order { get; set; }
        public bool IsCurrentSection { get; set; }
        public List<LearningPathCourseProgressDTO> Courses { get; set; } = new();
    }
}