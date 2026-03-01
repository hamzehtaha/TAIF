using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateContentRequest
    {
        public LessonItemType Type { get; set; }
        public Video? Video { get; set; }
        public RichText? RichText { get; set; }
        public QuizCreateDto? Quiz { get; set; }
    }
}