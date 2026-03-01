using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Filters
{
    public class UserEvaluationFilter : BaseFilter
    {
        public Guid? UserId { get; set; }
        public Guid? OrganizationId { get; set; }
        public int? MinPercentage { get; set; }
        public int? MaxPercentage { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
