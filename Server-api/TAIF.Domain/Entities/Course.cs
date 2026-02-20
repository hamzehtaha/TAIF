using System;

namespace TAIF.Domain.Entities
{
    public class Course : Base
    {
        public string? Name { get; set; } = null;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public Guid UserId { get; set; }
        public User Creator { get; set; } = null!;
        ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Guid> Tags { get; set; } = new List<Guid>();
        public double TotalDurationInSeconds { get; set; } = 0;
        public int TotalEnrolled { get; set; } = 0;
        public int TotalLessonItems { get; set; } = 0;
    }
}
