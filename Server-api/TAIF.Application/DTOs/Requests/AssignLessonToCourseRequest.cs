namespace TAIF.Application.DTOs.Requests;

public class AssignLessonToCourseRequest
{
    public Guid CourseId { get; set; }
    public Guid LessonId { get; set; }
    public int? Order { get; set; }
}
