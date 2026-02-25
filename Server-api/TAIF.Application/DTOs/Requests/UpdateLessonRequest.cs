namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid? InstructorId { get; set; }
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can change this
    }
}
