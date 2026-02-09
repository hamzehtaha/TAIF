namespace TAIF.Application.DTOs.Requests
{
    public record LessonItemRequest
    {
        public string Name { get; set; } = null!;
        public string URL { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int Type { get; set; }
        public Guid LessonId { get; set; }
    }
}