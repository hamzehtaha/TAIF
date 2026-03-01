using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record QuizResultResponse
    {
        public Guid SubmissionId { get; set; }
        public List<QuestionAnswerResult> Results { get; set; } = new();
        public int Score { get; set; }
        public bool IsCompleted { get; set; }
    }

    public record QuestionAnswerResult
    {
        public string QuestionId { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public string? Explanation { get; set; }
    }
}
