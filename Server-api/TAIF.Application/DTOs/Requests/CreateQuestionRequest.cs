namespace TAIF.Application.DTOs.Requests;

public class CreateQuestionRequest
{
    public string Text { get; set; } = null!;
    public List<string> Options { get; set; } = new();
    public int CorrectAnswerIndex { get; set; }
    public string? Explanation { get; set; }
    public int Points { get; set; } = 1;
    public int? Order { get; set; }
    public Guid? LessonItemId { get; set; }
}

public class CreateBulkQuestionsRequest
{
    public Guid LessonItemId { get; set; }
    public List<CreateQuestionRequest> Questions { get; set; } = new();
}
