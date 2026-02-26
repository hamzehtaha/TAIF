using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class Instructor : OrganizationBase
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Bio { get; set; }
        public List<string> Expertises { get; set; } = new List<string>();
        public int YearsOfExperience { get; set; }
    }

}
