using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record QuizResultResponse
    {
        public List<QuestionAnswersResponse> Results { get; set; } = [];
        public int Score { get; set; }
    }


}
