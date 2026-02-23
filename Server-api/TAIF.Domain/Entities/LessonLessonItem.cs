namespace TAIF.Domain.Entities
{
    public class LessonLessonItem : OrganizationBase
    {
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public Guid LessonItemId { get; set; }
        public LessonItem LessonItem { get; set; } = null!;
        public int Order { get; set; }
    }
}
