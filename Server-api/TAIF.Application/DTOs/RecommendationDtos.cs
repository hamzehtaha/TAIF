namespace TAIF.Application.DTOs
{
    public class CourseRecommendation
    {
        public Guid CourseId { get; set; }
        public double FinalScore { get; set; }
        public double BaseScore { get; set; }
        public double BehaviorFactor { get; set; }
    }

    public class RecommendationResponse
    {
        public Guid StudentId { get; set; }
        public List<CourseRecommendation> Recommendations { get; set; } = new();
        public int TotalCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateInterestRequest
    {
        public string Name { get; set; } = null!;
    }

    public class UpdateInterestRequest
    {
        public string Name { get; set; } = null!;
    }

    public class CreateTagRequest
    {
        public string Name { get; set; } = null!;
    }

    public class UpdateTagRequest
    {
        public string Name { get; set; } = null!;
    }

    public class CreateInterestTagMappingRequest
    {
        public Guid InterestId { get; set; }
        public Guid TagId { get; set; }
        public double Weight { get; set; } = 0.5;
    }

    public class UpdateMappingWeightRequest
    {
        public double Weight { get; set; }
    }

    public class RecordBehaviorEventRequest
    {
        public Guid UserId { get; set; }
        public Guid CourseId { get; set; }
        public string EventType { get; set; } = null!;
    }
}
