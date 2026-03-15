using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateEvaluationRequest
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public List<Guid> QuestionIds { get; set; } = new();
    }
    public class UpdateEvaluationRequest
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public List<Guid> QuestionIds { get; set; } = new();
    }
}
