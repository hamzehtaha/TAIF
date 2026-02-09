using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateInterestTagMappingRequest
    {
        public Guid InterestId { get; set; }
        public Guid TagId { get; set; }
        public double Weight { get; set; } = 0.5;
    }
}
