namespace TAIF.Domain.Entities
{
    public class CourseLesson : OrganizationBase
    {
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public int Order { get; set; }
    }
}
