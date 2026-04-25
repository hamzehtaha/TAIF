using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateEvaluationQuestionRequest
    {
        public string Text { get; set; } = string.Empty;
        public List<Guid>? SkillIds { get; set; }
        public List<CreateEvaluationAnswerDto>? Answers { get; set; }
    }

    public class CreateEvaluationAnswerDto
    {
        public string Text { get; set; } = string.Empty;
        public int Score { get; set; }
    }

    public class UpdateEvaluationQuestionRequest
    {
        public string? Text { get; set; }
        public List<Guid>? SkillIds { get; set; }
    }

    public class CreateEvaluationAnswerRequest
    {
        public Guid EvaluationQuestionId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Score { get; set; }
    }

    public class UpdateEvaluationAnswerRequest
    {
        public string? Text { get; set; }
        public int? Score { get; set; }
    }
}
