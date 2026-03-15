using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateAnswerRequest
    {
        [Required(ErrorMessage = "Answer text is required.")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Text must be between 1 and 1000 characters.")]
        public string Text { get; set; } = string.Empty;
    }

    public class UpdateAnswerRequest
    {
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Text must be between 1 and 1000 characters.")]
        public string? Text { get; set; }
    }
}
