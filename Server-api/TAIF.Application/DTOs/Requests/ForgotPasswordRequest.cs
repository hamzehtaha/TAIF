using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public record ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
    public string Email { get; set; } = null!;

    [StringLength(200)]
    public string? OrgSlug { get; set; }
}
