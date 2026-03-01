using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class Question : OrganizationBase
    {
        public string Info { get; set; } = string.Empty;
        public string Goals { get; set; } = string.Empty;
        public List<Guid> AnswerIds { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
        public int MinPercentage { get; set; } = 100;
        public List<Guid> SkillIds { get; set; } = new();
    }
}
