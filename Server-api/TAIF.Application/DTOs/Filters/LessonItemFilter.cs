using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Filters
{
    public class LessonItemFilter : BaseFilter
    {
        public string? Search { get; set; }
        public Guid? LessonId { get; set; }
        public Guid? CourseId { get; set; }
        public LessonItemType? Type { get; set; }
    }
}
