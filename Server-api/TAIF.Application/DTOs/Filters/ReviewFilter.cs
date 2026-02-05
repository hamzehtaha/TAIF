using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class ReviewFilter : BaseFilter
    {
        public Guid? CourseId { get; set; }
        public Guid? UserId { get; set; }
        public int? Rating { get; set; }
    }
}
