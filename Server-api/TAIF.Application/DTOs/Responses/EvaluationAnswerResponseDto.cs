using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record EvaluationAnswerResponseDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = null!;
        public int Score { get; set; }
    }
}
