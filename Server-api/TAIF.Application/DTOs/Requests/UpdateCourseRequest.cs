using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateCourseRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; } 
        public string? Photo { get; set; }
        public Guid? CategoryId { get; set; }
        public List<Guid>? Tags { get; set; }
    }
}