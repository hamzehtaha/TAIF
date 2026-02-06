using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class LessonFilter : BaseFilter
    {
        public string? Search { get; set; }
        public Guid? CourseId { get; set; }

        public int? MinOrder { get; set; }
        public int? MaxOrder { get; set; }

        public bool? HasItems { get; set; }
    }
}
