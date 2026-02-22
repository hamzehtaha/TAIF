using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record EvaluationQuestionResponseDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = null!;
        public int Order { get; set; }

        public List<EvaluationAnswerResponseDto> Answers { get; set; }
            = new();
    }
}
