using TAIF.Application.DTOs.Payloads;
using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.Responses
{
    public record QuizSubmissionResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid LessonItemId { get; set; }
        public int Score { get; set; }
        public bool IsCompleted { get; set; }
        public List<QuizAnswerPayload> Answers { get; set; } = new();
        public Quiz? Quiz { get; set; }
    }

}