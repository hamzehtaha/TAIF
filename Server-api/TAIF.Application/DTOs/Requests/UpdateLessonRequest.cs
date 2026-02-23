namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        
        // Instructor information
        public string? InstructorName { get; set; }
        public string? InstructorBio { get; set; }
        public string? InstructorPhoto { get; set; }
    }
}
