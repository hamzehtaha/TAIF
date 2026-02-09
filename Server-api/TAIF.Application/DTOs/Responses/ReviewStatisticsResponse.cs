using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Responses
{
    public record ReviewStatisticsResponse
    {
        public Guid CourseId { get; set; }
        public string? CourseName { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
        public double FiveStarPercentage { get; set; }
        public double FourStarPercentage { get; set; }
        public double ThreeStarPercentage { get; set; }
        public double TwoStarPercentage { get; set; }
        public double OneStarPercentage { get; set; }
    }
}
