using System;
using TAIF.Domain.Entities;

namespace TAIF.Domain.Models
{
    public class EvaluationQuestionMapping : OrganizationBase
    {
        public Guid QuestionId { get; set; }
        public int Order { get; set; }
        
        public Guid EvaluationId { get; set; }
        public Evaluation? Evaluation { get; set; }
    }
}
