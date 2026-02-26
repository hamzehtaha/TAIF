using System;
using static TAIF.Domain.Entities.Enums;
using System.Collections.Generic;

namespace TAIF.Domain.Entities
{
    public class LessonItem : OrganizationBase
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public LessonItemType Type { get; set; }
        public Guid? ContentId { get; set; }
        public Content? Content { get; set; }
        public double DurationInSeconds { get; set; } = 0;
        public List<Guid> SkillIds { get; set; } = new();
        public ICollection<LessonLessonItem> LessonLessonItems { get; set; } = new List<LessonLessonItem>();
    }
}