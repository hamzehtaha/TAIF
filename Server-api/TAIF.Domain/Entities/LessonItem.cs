using System;

namespace TAIF.Domain.Entities
{
    public class LessonItem : Base
    {
        public string Name { get; set; } = null!;
        public string URL { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int Type { get; set; }
        public Guid LessonId { get; set; }
    }
}