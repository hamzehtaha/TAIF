using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class Quiz : IContentData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("questions")]
        public List<QuizQuestion> Questions { get; set; } = new();
    }

    public class QuizQuestion
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
        
        [JsonPropertyName("questionText")]
        public string QuestionText { get; set; } = string.Empty;
        
        [JsonPropertyName("shuffleOptions")]
        public bool ShuffleOptions { get; set; } = false;
        
        [JsonPropertyName("options")]
        public List<QuizOption> Options { get; set; } = new();
        
        [JsonPropertyName("correctAnswerId")]
        public string CorrectAnswerId { get; set; } = string.Empty;
        
        [JsonPropertyName("explanation")]
        public string? Explanation { get; set; }
    }

    public class QuizOption
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
        
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }
}
