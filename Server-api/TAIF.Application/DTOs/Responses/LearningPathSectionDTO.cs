namespace TAIF.Application.DTOs.Responses
{
    public class LearningPathSectionDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Order { get; set; }
        public List<LearningPathCourseDTO> Courses { get; set; } = new();
    }
}