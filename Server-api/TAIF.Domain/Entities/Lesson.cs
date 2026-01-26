using System;
using TAIF.Domain.Entities;

namespace TAIF.Domain.Entities
{
    public class Lesson : Base
    {
        public string Title { get; set; } = null!;
        public string URL { get; set; } = null!;
        public Guid CourseId { get; set; }
        public string? Photo { get; set; }

    }
}