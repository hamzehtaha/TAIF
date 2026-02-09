using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateLessonItemRequest
    {
        public string? Name { get; set; }
        public string? Content { get; set; }
        public LessonItemType Type { get; set; }
        public Guid LessonId { get; set; }
        public double durationInSeconds { get; set; } = 0;
    }
}
