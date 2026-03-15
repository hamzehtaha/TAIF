using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests
{
    public record SubmitEvaluation
    {
        [Required(ErrorMessage = "Answers are required.")]
        [MinLength(1, ErrorMessage = "At least one answer must be submitted.")]
        public List<EvaluationAnswerSubmission> Answers { get; set; } = new();
    }

    public record EvaluationAnswerSubmission
    {
        [Required(ErrorMessage = "Question ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Question ID must not be an empty GUID.")]
        public Guid QuestionId { get; set; }

        [Required(ErrorMessage = "Answer ID is required.")]
        [NonEmptyGuid(ErrorMessage = "Answer ID must not be an empty GUID.")]
        public Guid AnswerId { get; set; }
    }
}
