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

        /// <summary>
        /// JSON payload of submitted answers
        /// Example:
        /// [
        ///   { "questionId": "q1", "answerIndex": 2, "isCorrect": true }
        /// ]
        /// </summary>
        public string AnswersJson { get; set; } = null!;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        // Navigation (optional but recommended)
        public LessonItem LessonItem { get; set; } = null!;
    }
}
