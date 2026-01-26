using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs
{
    public record CreateCourseRequest
    {
        [Required]
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
    }
}