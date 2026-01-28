using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs
{
    public record CreateLessonItemRequest
    {
        [Required]
        public string Name { get; set; } = null!;
        [Required]
        public string URL { get; set; } = null!;
        [Required]
        public string Content { get; set; } = null!;
        [Required]
        public LessonItemType Type { get; set; }
        [Required]
        public Guid LessonId { get; set; }
        [Required]
        public double durationInSeconds { get; set; } = 0;
    }
}
