using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public  class LessonItemProgress : Base
    {
        public Guid UserId { get; set; }
        public User User { get; set; }

        public Guid LessonItemId { get; set; }
        public LessonItem LessonItem { get; set; }
        public bool IsCompleted { get; set; } = false;

    }
}
