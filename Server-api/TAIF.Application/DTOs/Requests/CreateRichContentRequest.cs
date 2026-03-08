using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class CreateRichContentRequest
{
    [Required(ErrorMessage = "HTML content is required.")]
    [MinLength(1, ErrorMessage = "HTML content cannot be empty.")]
    public string Html { get; set; } = null!;

    public Guid? LessonItemId { get; set; }
}
