using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateAnswerRequest
    {
        public string Text { get; set; } = string.Empty;
    }
    public class UpdateAnswerRequest
    {
        public string? Text { get; set; }
    }
}
