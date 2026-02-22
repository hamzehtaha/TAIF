namespace TAIF.Application.DTOs.Responses
{
    public class CourseCompletionEligibilityResponse
    {
        public bool IsEligible { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public double CompletionPercentage { get; set; }
        public string? Message { get; set; }
    }
}