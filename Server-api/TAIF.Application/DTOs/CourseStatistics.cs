namespace TAIF.Application.DTOs
{
    /// <summary>
    /// Aggregated statistics for a course from lesson items
    /// </summary>
    public record CourseStatisticsDTO
    {
        public double TotalDuration { get; init; }
        public int TotalLessonItems { get; init; }
    }
}