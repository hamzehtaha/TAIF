using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Models;

namespace TAIF.Domain.Entities
{
    public class Evaluation : OrganizationBase
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Guid? InterestId { get; set; }

        public ICollection<EvaluationQuestionMapping> QuestionMappings { get; set; } = new List<EvaluationQuestionMapping>();
    }
}
