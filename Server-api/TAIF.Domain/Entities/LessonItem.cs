using System;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Domain.Entities
{
    public class LessonItem : Base
    {
        public string Name { get; set; } = null!;
        public LessonItemType Type { get; set; }
        public string Content { get; set; } = null!;
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public int Order { get; set; }
        public double DurationInSeconds { get; set; } = 0;
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }

}