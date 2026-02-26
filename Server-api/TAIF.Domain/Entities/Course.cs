using System;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Domain.Entities
{
    public class Course : OrganizationBase
    {
        public string? Name { get; set; } = null;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public ICollection<CourseLesson> CourseLessons { get; set; } = new List<CourseLesson>();
        public ICollection<Guid> Tags { get; set; } = new List<Guid>();
        public double TotalDurationInSeconds { get; set; } = 0;
        public int TotalEnrolled { get; set; } = 0;
        public int TotalLessonItems { get; set; } = 0;
        public int TotalLessons { get; set; } = 0;
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
    }
}
