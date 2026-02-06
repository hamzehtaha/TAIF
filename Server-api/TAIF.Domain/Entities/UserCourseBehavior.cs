namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Tracks cumulative behavior score per user-course pair.
    /// Score decays over time based on LastUpdatedAt.
    /// </summary>
    public class UserCourseBehavior : Base
    {
        public Guid UserId { get; set; }
        public Guid CourseId { get; set; }
        public double BehaviorScore { get; set; }
        public User User { get; set; } = null!;
        public Course Course { get; set; } = null!;
    }
}
