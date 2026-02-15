using System;

namespace TAIF.Domain.Entities
{
    public class UserLearningPathProgress : Base
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid LearningPathId { get; set; }
        public LearningPath LearningPath { get; set; } = null!;
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public Guid? CurrentSectionId { get; set; }
        public LearningPathSection? CurrentSection { get; set; }
        public Guid? CurrentCourseId { get; set; }
        public Course? CurrentCourse { get; set; }
        public double CompletedDuration { get; set; } = 0.0;
    }
}