using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateInterestRequest
    {
        [Required(ErrorMessage = "Interest name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Interest name must be between 2 and 100 characters.")]
        public string Name { get; set; } = null!;
    }
}
