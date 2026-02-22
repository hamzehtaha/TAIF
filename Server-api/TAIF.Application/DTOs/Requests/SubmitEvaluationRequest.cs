using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record SubmitEvaluation
    {
        public List<EvaluationAnswerSubmission> Answers { get; set; } = new();
    }

    public record EvaluationAnswerSubmission
    {
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
    }
}
