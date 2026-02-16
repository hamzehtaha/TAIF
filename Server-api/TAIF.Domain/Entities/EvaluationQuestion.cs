using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class EvaluationQuestion : Base
    {
        public string Text { get; set; } = null!;
        public int Order { get; set; }
        public ICollection<EvaluationAnswer> Answers { get; set; }
            = new List<EvaluationAnswer>();
    }
}
