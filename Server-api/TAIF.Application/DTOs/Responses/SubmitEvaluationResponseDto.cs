using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record SubmitEvaluationResponseDto
    {
        public Guid EvaluationId { get; set; }
        public int TotalScore { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
