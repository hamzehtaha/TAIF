using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonItemRequest
    {
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters.")]
        public string? Name { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        public Guid? ContentId { get; set; }

        [EnumDataType(typeof(LessonItemType), ErrorMessage = "Type must be a valid lesson item type.")]
        public LessonItemType? Type { get; set; }

        public Guid? LessonId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
        public double? DurationInSeconds { get; set; }

        public List<Guid> SkillIds { get; set; } = new();
    }
}
