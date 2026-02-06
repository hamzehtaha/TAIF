using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs
{
    public record UpdateCourseRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public List<Guid>? Tags { get; set; }
    }
}