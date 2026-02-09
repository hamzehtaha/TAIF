using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record RecordBehaviorEventRequest
    {
        public Guid UserId { get; set; }
        public Guid CourseId { get; set; }
        public string EventType { get; set; } = null!;
    }
}
