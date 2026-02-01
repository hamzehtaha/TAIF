using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class CourseFilter : BaseFilter
    {
        public string? Search { get; set; }
        public bool? IsActive { get; set; }
        public Guid? CategoryId { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
    }
}
