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
        public Guid? OrganizationId { get; set; }
        
        public string? WebsiteUrl { get; set; }
        public int YearsOfExperience { get; set; }
        public decimal Rating { get; set; } = 0m;
        public int CoursesCount { get; set; } = 0;
        
        // Navigation
        public User User { get; set; } = null!;
        public Organization? Organization { get; set; }
    }

}
