using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateLessonItemRequest
    {
        [Required]
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        [Required]
        public Guid ContentId { get; set; }
        [Required]
        public LessonItemType Type { get; set; }
        [Required]
        public Guid LessonId { get; set; }
        public double DurationInSeconds { get; set; } = 0;
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can set this
        public List<Guid> SkillIds { get; set; } = new();
    }
}
