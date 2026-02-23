using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class InstructorProfile : OrganizationBase
    {
        public Guid UserId { get; set; }
        
        public string? Bio { get; set; }
        public List<string> Expertises { get; set; } = new List<string>();
        public int YearsOfExperience { get; set; }
        public decimal Rating { get; set; } = 0m;
        public int CoursesCount { get; set; } = 0;
        
        // Navigation
        public User User { get; set; } = null!;
    }

}
