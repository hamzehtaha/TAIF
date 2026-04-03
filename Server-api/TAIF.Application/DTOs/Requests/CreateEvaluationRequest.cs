using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class QuestionMappingDto
    {
        public Guid QuestionId { get; set; }
        public int Order { get; set; }
    }

    public class CreateEvaluationRequest
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Guid? InterestId { get; set; }

        public List<QuestionMappingDto> QuestionMappings { get; set; } = new();
    }

    public class UpdateEvaluationRequest
    {
        public string? Name { get; set; }

        public string? Description { get; set; }

        public Guid? InterestId { get; set; }

        public List<QuestionMappingDto>? QuestionMappings { get; set; }
    }
}
