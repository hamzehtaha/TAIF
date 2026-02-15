using System;
using System.Collections.Generic;

namespace TAIF.Domain.Entities
{
    public class LearningPath : Base
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CreatorId { get; set; }
        public User Creator { get; set; } = null!;
        public int TotalEnrolled { get; set; } = 0;
        public double DurationInSeconds { get; set; } = 0;
        public ICollection<LearningPathSection> Sections { get; set; } = new List<LearningPathSection>();
    }
}