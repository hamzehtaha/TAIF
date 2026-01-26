namespace TAIF.Application.DTOs
{
    public class LessonItemRequest
    {
        public string Title { get; set; } = null!;
        public string URL { get; set; } = null!;
        public int LessonType { get; set; }
        public int CourseId { get; set; }
    }
}