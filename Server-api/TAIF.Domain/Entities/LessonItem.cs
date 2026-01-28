using System;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Domain.Entities
{
    public class LessonItem : Base
    {
        public string Name { get; set; } = null!;
        public string URL { get; set; } = null!;
        public string Content { get; set; } = null!;
        public LessonItemType Type { get; set; }
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public double DurationInSeconds { get; set; } = 0;
    }
}