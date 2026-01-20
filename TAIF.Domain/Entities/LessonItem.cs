namespace TAIF.Domain.Entities
{
    public class LessonItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string URL { get; set; } = null!;
        public int LessonType { get; set; }
        public int CourseId { get; set; }
    }
}