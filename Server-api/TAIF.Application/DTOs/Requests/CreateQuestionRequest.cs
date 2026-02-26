namespace TAIF.Application.DTOs.Requests;

public class CreateQuestionRequest
{
    public string Info { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public List<Guid>? AnswerIds { get; set; }
    public int CorrectAnswerIndex { get; set; }
    public int MinPercentage { get; set; } = 100;
    public List<Guid>? SkillIds { get; set; }
}
public class UpdateQuestionRequest
{
    public string? Info { get; set; }
    public string? Goals { get; set; }
    public List<Guid>? AnswerIds { get; set; }
    public int? CorrectAnswerIndex { get; set; }
    public int? MinPercentage { get; set; }
    public List<Guid>? SkillIds { get; set; }
}
