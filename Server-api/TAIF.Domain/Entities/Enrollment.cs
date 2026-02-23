namespace TAIF.Domain.Entities
{
    public class Enrollment : OrganizationBase
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public bool IsFavourite { get; set; } = false;
        public Guid? LastLessonItemId { get; set; }
        public LessonItem? LastLessonItem { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? CompletedAt { get; set; }
    }
}
