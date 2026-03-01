using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class QuizSubmission : Base
    {
        public Guid UserId { get; set; }
        public Guid LessonItemId { get; set; }
        
        public string AnswersJson { get; set; } = string.Empty;
        public int Score { get; set; }
        public bool IsCompleted { get; set; }
        
        // Navigation properties
        public User User { get; set; } = null!;
        public LessonItem LessonItem { get; set; } = null!;
    }
}
