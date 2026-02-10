using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record EnrollRequest
    {
        public Guid CourseId { get; set; }
    }
}
