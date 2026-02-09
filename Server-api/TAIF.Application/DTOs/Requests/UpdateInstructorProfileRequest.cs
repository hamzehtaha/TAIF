using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public class UpdateInstructorProfileRequest
    {
        public string? Bio { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? WebsiteUrl { get; set; }
    }
}
