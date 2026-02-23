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
        public string? Content { get; set; }
        public double DurationInSeconds { get; set; } = 0;
        public Guid CreatedByUserId { get; set; }
        public User CreatedBy { get; set; } = null!;
        public ICollection<LessonLessonItem> LessonLessonItems { get; set; } = new List<LessonLessonItem>();
        public Video? Video { get; set; }
        public RichContent? RichContent { get; set; }
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}