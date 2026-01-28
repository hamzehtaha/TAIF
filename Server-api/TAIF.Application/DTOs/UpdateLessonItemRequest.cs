namespace TAIF.Application.DTOs
{
    public record UpdateLessonItemRequest
    {
        public string? Name { get; set; }
        public string? URL { get; set; }
        public string? Content { get; set; }
        public int? Type { get; set; }
        public Guid? LessonId { get; set; }
        public double? durationInSeconds { get; set; } = 0;
    }
}
