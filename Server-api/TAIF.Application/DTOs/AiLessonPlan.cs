using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs
{
    public class AiLessonPlan
    {
        public List<Guid> LessonOrder { get; set; } = new();
    }
}
