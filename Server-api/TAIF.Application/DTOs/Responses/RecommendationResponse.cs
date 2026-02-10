using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record RecommendationResponse
    {
        public Guid StudentId { get; set; }
        public List<CourseRecommendation> Recommendations { get; set; } = new();
        public int TotalCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
