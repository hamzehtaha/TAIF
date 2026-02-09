using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class InstructorProfile : Base
    {
        public Guid UserId { get; set; }
        public string Bio { get; set; } = null!;
        public int YearsOfExperience { get; set; }
        public int CoursesCount { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public User User { get; set; } = null!;
    }

}
