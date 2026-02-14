using System;
using System.Collections.Generic;

namespace TAIF.Domain.Entities
{
    public class LearningPathSection : Base
    {
        public Guid LearningPathId { get; set; }
        public LearningPath LearningPath { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Order { get; set; }
        public ICollection<LearningPathCourse> Courses { get; set; } = new List<LearningPathCourse>();
    }
}