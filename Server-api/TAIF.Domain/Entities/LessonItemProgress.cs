using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class LessonItemProgress : OrganizationBase
    {
        public Guid UserId { get; set; }
        public User User { get; set; }

        public Guid LessonItemId { get; set; }
        public LessonItem LessonItem { get; set; }
        
        public Guid CourseID { get; set; }
        public Guid LessonID { get; set; }
        
        public bool IsCompleted { get; set; } = false;
        public double CompletedDurationInSeconds { get; set; } = 0;
        
        // ✅ ADD THIS PROPERTY
        public DateTime? CompletedAt { get; set; }
    }
}