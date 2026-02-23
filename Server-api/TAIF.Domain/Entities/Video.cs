namespace TAIF.Domain.Entities
{
    public class Video : OrganizationBase
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string Url { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public double DurationInSeconds { get; set; }
        public Guid? LessonItemId { get; set; }
        public LessonItem? LessonItem { get; set; }
    }
}
