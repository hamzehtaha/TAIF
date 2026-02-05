using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs
{
    public record QuizResultResponse
    {
        public List<QuestionResult> Results { get; set; } = [];
        public int Score { get; set; }
    }
    public record QuestionResult
    {
        public string QuestionId { get; set; } = null!;
        public bool IsCorrect { get; set; }
    }

}
