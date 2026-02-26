using System;
using TAIF.Domain.Entities;

namespace TAIF.Domain.Entities
{
    public class Lesson : OrganizationBase
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid? InstructorId { get; set; }
        public Instructor? Instructor { get; set; }
        public ICollection<CourseLesson> CourseLessons { get; set; } = new List<CourseLesson>();
        public ICollection<LessonLessonItem> LessonLessonItems { get; set; } = new List<LessonLessonItem>();
        public double TotalDurationInSeconds { get; set; } = 0;
        public int TotalLessonItems { get; set; } = 0;
    }
}