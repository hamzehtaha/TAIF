using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Models;

namespace TAIF.Domain.Entities
{
    public class UserEvaluation : OrganizationBase
    {
        public Guid UserId { get; set; }

        [NotMapped]
        public EvaluationJsonResult Result { get; set; } = new();
    }
}
