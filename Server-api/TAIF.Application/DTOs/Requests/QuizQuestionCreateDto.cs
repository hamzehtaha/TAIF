using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public record QuizQuestionCreateDto
{
    public string? Id { get; set; } // Optional - sent only when editing

    [Required(ErrorMessage = "Question text is required.")]
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Question text must be between 1 and 1000 characters.")]
    public string QuestionText { get; set; } = string.Empty;

    public bool ShuffleOptions { get; set; } = false;

    [Required(ErrorMessage = "At least two options are required.")]
    [MinLength(2, ErrorMessage = "A question must have at least two options.")]
    public List<QuizOptionDto> Options { get; set; } = new();

    public string? CorrectAnswerId { get; set; }    // For editing
    public int? CorrectAnswerIndex { get; set; }    // For creating

    [StringLength(1000, ErrorMessage = "Explanation must not exceed 1000 characters.")]
    public string? Explanation { get; set; }
}
