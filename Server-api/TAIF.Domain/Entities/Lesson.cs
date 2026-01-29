using System;
using TAIF.Domain.Entities;

namespace TAIF.Domain.Entities
{
    public class Lesson : Base
    {
        public string Title { get; set; } = null!;
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public string? Photo { get; set; }
        public int Order { get; set; }
        ICollection<LessonItem> LessonItems { get; set; } = new List<LessonItem>();
    }
}