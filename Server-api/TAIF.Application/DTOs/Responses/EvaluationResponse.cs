using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class QuestionMappingResponseDto
    {
        public Guid QuestionId { get; set; }
        public int Order { get; set; }
    }

    public class EvaluationResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Guid? InterestId { get; set; }

        public List<QuestionMappingResponseDto> QuestionMappings { get; set; } = new();
    }
}
