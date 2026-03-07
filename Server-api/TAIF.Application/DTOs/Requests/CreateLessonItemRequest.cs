using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateLessonItemRequest
    {
        [Required(ErrorMessage = "Lesson item name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters.")]
        public string Name { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Content ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Content ID must not be an empty GUID.")]
        public Guid ContentId { get; set; }

        [Required(ErrorMessage = "Lesson item type is required.")]
        [EnumDataType(typeof(LessonItemType), ErrorMessage = "Type must be a valid lesson item type.")]
        public LessonItemType Type { get; set; }

        [Required(ErrorMessage = "Lesson ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Lesson ID must not be an empty GUID.")]
        public Guid LessonId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
        public double DurationInSeconds { get; set; } = 0;

        public Guid? OrganizationId { get; set; } // Only SuperAdmin can set this
        public List<Guid> SkillIds { get; set; } = new();
    }
}
