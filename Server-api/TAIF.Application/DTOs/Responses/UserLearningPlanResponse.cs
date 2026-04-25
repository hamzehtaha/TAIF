namespace TAIF.Application.DTOs.Responses
{
    public class LessonPlanItemDto
    {
        public Guid LessonItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double DurationInSeconds { get; set; }
        public List<Guid> SkillIds { get; set; } = new();
    }

    public class UserLearningPlanResponse
    {
        public List<Guid> StrengthSkillIds { get; set; } = new();
        public List<Guid> WeaknessSkillIds { get; set; } = new();
        public List<LessonPlanItemDto> LessonItems { get; set; } = new();
    }
}
