using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class SubmitEvaluationResponseDto
    {
        public Guid EvaluationId { get; set; }
        public int TotalPercentage { get; set; }
        public DateTime CompletedAt { get; set; }
        public List<QuestionEvaluationResultDto> Questions { get; set; } = new();
        public List<Guid> StrengthSkillIds { get; set; } = new();
        public List<Guid> WeaknessSkillIds { get; set; } = new();
        public Dictionary<string, string> SkillNames { get; set; } = new();
    }

    public class QuestionEvaluationResultDto
    {
        public Guid QuestionId { get; set; }
        public Guid SelectedAnswerId { get; set; }
        public int Percentage { get; set; }
    }
}
