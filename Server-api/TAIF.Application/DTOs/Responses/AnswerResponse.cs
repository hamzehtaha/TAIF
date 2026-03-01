using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class AnswerResponse
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public Guid? OrganizationId { get; set; }
    }
}
