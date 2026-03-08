using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public record QuizCreateDto
{
    [Required(ErrorMessage = "Quiz title is required.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Quiz title must be between 2 and 300 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "At least one question is required.")]
    [MinLength(1, ErrorMessage = "A quiz must have at least one question.")]
    public List<QuizQuestionCreateDto> Questions { get; set; } = new();
}
