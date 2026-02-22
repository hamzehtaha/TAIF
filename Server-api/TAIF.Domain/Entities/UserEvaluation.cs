using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class UserEvaluation : Base
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // JSON like:
        // [
        //   { "QuestionId": "...", "AnswerId": "..." },
        //   { "QuestionId": "...", "AnswerId": "..." }
        // ]
        public string AnswersJson { get; set; } = null!;

        public int TotalScore { get; set; }

        public DateTime CompletedAt { get; set; }
    }
}
