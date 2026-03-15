using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public record QuizOptionDto
{
    public string? Id { get; set; } // Optional - sent only when editing

    [Required(ErrorMessage = "Option text is required.")]
    [StringLength(500, MinimumLength = 1, ErrorMessage = "Option text must be between 1 and 500 characters.")]
    public string Text { get; set; } = string.Empty;
}
