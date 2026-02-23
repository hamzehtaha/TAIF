using System.Text.Json;

namespace TAIF.Domain.Entities
{
    public class Question : OrganizationBase
    {
        public string Text { get; set; } = null!;
        public string Options { get; set; } = "[]";
        public int CorrectAnswerIndex { get; set; }
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int Order { get; set; }
        public Guid? LessonItemId { get; set; }
        public LessonItem? LessonItem { get; set; }
        public List<string> GetOptionsList()
        {
            try
            {
                return JsonSerializer.Deserialize<List<string>>(Options) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }
        public void SetOptionsList(List<string> options)
        {
            Options = JsonSerializer.Serialize(options);
        }
    }
}
