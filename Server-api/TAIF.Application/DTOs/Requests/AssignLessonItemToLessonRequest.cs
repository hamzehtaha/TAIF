namespace TAIF.Application.DTOs.Requests;

public class AssignLessonItemToLessonRequest
{
    public Guid LessonId { get; set; }
    public Guid LessonItemId { get; set; }
    public int? Order { get; set; }
}
