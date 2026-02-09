using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class InstructorProfileResponse
    {
        public Guid Id { get; set; }
        public string Bio { get; set; } = null!;
        public int YearsOfExperience { get; set; }
        public int CoursesCount { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public bool IsVerified { get; set; } = false;
    }
}
