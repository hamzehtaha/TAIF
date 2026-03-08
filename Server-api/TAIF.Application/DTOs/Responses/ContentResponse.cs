using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Responses
{
    public class ContentResponse
    {
        public Guid Id { get; set; }
        public LessonItemType Type { get; set; }
        public string ContentJson { get; set; } = null!;
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

