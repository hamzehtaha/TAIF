using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class EvaluationAnswer : Base
    {
        public Guid EvaluationQuestionId { get; set; }
        public EvaluationQuestion EvaluationQuestion { get; set; } = null!;
        public string Text { get; set; } = null!;
        public int Score { get; set; }
    }
}
