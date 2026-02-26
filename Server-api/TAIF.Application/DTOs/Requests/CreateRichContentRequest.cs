namespace TAIF.Application.DTOs.Requests;

public class CreateRichContentRequest
{
    public string Html { get; set; } = null!;
    public Guid? LessonItemId { get; set; }
}
