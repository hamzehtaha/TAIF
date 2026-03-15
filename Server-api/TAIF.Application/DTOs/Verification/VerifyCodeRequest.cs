using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Verification;

public record VerifyCodeRequest
{
    [Required]
    public Guid UserId { get; init; }

    [Required]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be exactly 6 characters.")]
    public string Code { get; init; } = null!;
}
