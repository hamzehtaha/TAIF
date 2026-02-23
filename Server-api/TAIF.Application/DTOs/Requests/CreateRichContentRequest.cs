namespace TAIF.Application.DTOs.Requests;

public class CreateRichContentRequest
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Content { get; set; } = null!;
    public string ContentType { get; set; } = "html";
    public Guid? LessonItemId { get; set; }
}
