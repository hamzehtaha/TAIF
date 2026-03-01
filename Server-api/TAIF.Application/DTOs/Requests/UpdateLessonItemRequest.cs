using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonItemRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? ContentId { get; set; }
        public LessonItemType? Type { get; set; }
        public Guid? LessonId { get; set; }
        public double? DurationInSeconds { get; set; }
        public List<Guid> SkillIds { get; set; } = new();
    }
}
