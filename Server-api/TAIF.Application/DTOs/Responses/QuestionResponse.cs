using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class QuestionResponse
    {
        public Guid Id { get; set; }
        public string Info { get; set; } = string.Empty;
        public string Goals { get; set; } = string.Empty;
        public List<Guid> AnswerIds { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
        public int MinPercentage { get; set; }
        public List<Guid> SkillIds { get; set; } = new();
        public Guid? OrganizationId { get; set; }
    }
}
