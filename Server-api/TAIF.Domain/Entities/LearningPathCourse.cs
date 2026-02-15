using System;

namespace TAIF.Domain.Entities
{
    public class LearningPathCourse : Base
    {
        public Guid LearningPathSectionId { get; set; }
        public LearningPathSection Section { get; set; } = null!;
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int Order { get; set; }
        public bool IsRequired { get; set; } = true;
    }
}