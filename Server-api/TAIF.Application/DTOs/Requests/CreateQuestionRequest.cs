namespace TAIF.Application.DTOs.Requests;

public class CreateQuestionRequest
{
    public string Text { get; set; } = null!;
    public List<string> Options { get; set; } = new();
    public int CorrectAnswerIndex { get; set; }
    public string? Explanation { get; set; }
    public int? Order { get; set; }
}
