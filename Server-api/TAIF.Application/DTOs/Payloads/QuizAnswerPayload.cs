using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Payloads
{
    public record QuizAnswerPayload
    {
        public string QuestionId { get; set; } = string.Empty;
        public string SelectedOptionId { get; set; } = string.Empty;
    }
}
