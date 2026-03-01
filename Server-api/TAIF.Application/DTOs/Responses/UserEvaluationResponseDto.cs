using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public class UserEvaluationResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? OrganizationId { get; set; }
        public int TotalPercentage { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
