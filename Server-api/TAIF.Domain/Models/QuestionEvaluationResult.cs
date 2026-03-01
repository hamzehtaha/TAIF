using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Models
{
    public class QuestionEvaluationResult
    {
        public Guid QuestionId { get; set; }
        public Guid SelectedAnswerId { get; set; }
        public int Percentage { get; set; }
    }
    public class EvaluationJsonResult
    {
        public List<QuestionEvaluationResult> Questions { get; set; } = new();
        public int TotalPercentage { get; set; }
    }
}
