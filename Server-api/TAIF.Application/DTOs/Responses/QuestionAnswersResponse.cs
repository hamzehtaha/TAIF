using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record QuestionAnswersResponse
    {
        public string QuestionId { get; set; } = null!;
        public bool IsCorrect { get; set; }
    }
}
