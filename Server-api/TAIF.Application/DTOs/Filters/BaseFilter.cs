using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class BaseFilter
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
