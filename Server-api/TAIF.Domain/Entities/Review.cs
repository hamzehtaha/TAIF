using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class Review : OrganizationBase
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public int Rating { get; set; } // 1-5 stars
        public string? Comment { get; set; }
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }
}
