namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonRequest
    {
        public string? Title { get; set; }
        public string? URL { get; set; }
        public Guid? CourseId { get; set; }
        public string? Photo { get; set; }
    }
}
