using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateSkillRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
    public class UpdateSkillRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}
