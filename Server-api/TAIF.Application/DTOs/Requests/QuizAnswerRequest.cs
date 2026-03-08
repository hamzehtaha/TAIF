using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record QuizAnswerRequest
    {
        [Required(ErrorMessage = "Question ID is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Question ID must be between 1 and 100 characters.")]
        public string QuestionId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Selected option ID is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Selected option ID must be between 1 and 100 characters.")]
        public string SelectedOptionId { get; set; } = string.Empty;
    }
}
