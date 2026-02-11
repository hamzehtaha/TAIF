namespace TAIF.Application.DTOs.Requests
{
    public class UpdateLastLessonItemRequest
    {
        public Guid CourseId { get; set; }
        public Guid LessonItemId { get; set; }
    }
}