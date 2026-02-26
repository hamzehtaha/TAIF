namespace TAIF.Application.DTOs.Responses;

public class LessonLessonItemResponse
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public Guid LessonItemId { get; set; }
    public int Order { get; set; }
    public string? LessonItemName { get; set; }
    public int? LessonItemType { get; set; }
}
