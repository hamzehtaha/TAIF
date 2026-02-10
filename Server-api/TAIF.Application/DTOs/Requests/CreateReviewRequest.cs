using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateReviewRequest
    {
        public Guid CourseId { get; set; }
        public int Rating { get; set; } // 1-5 stars
        public string? Comment { get; set; }
    }
}
