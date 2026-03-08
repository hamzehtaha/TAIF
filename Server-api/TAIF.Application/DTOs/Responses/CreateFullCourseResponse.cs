namespace TAIF.Application.DTOs.Responses
{
    /// <summary>
    /// Response DTO for the bulk course creation operation.
    /// </summary>
    public record CreateFullCourseResponse
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public int LessonsCreated { get; set; }
        public int LessonItemsCreated { get; set; }
        public int ContentsCreated { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
