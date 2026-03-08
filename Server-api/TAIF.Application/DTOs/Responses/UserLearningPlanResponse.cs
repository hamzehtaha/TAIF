using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class LessonPlanItemDto
    {
        public Guid LessonItemId { get; set; }

        public string Name { get; set; } = string.Empty;

        public double DurationInSeconds { get; set; }
    }
    public class UserLearningPlanResponse
    {
        public List<Guid> MissingSkillIds { get; set; } = new();

        public List<LessonPlanItemDto> RecommendedLessons { get; set; } = new();
    }
}
