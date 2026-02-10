using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Payloads
{
    public record QuizAnswerPayload
    {
        public string QuestionId { get; init; } = null!;
        public int SelectedAnswerIndex { get; init; }
        public int CorrectAnswerIndex { get; init; }
        public bool IsCorrect { get; init; }
    }

}
