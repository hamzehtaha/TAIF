using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record RefreshTokenRequest
    {
        [Required(ErrorMessage = "Refresh token is required.")]
        [StringLength(2048, MinimumLength = 1, ErrorMessage = "Refresh token must be between 1 and 2048 characters.")]
        public string RefreshToken { get; set; } = null!;
    }
}
