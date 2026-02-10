using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateTagRequest
    {
        public string? Name { get; set; }
    }
}
