using System;
using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateCourseRequest
    {
        [Required]
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        public List<Guid> Tags { get; set; }
    }
}