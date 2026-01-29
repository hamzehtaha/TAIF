using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs
{
    public class LessonItemResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string URL { get; set; } = null!;
        public string Content { get; set; } = null!;
        public LessonItemType Type { get; set; }
        public double DurationInSeconds { get; set; }
        public int Order { get; set; }

        public bool IsCompleted { get; set; }
    }
}
