namespace TAIF.Application.DTOs
{
    public class CreateCourseRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
    }
}