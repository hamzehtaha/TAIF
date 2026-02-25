using System.Text.Json;
using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class Quiz : IContentData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("questions")]
        public List<QuizQuestion> Questions { get; set; }
    }

    public class QuizQuestion
    {
        [JsonPropertyName("questionText")]
        public string QuestionText { get; set; }
        
        [JsonPropertyName("options")]
        public List<string> Options { get; set; }
        
        [JsonPropertyName("correctAnswerIndex")]
        public int CorrectAnswerIndex { get; set; }
    }
}
