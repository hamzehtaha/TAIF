using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class Answer : OrganizationBase
    {
        public string Text { get; set; } = string.Empty;
    }
}
