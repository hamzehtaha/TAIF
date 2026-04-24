using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record LoginRequest
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [StringLength(256, ErrorMessage = "Email must not exceed 256 characters.")]
        public required string Email { get; set; }

        public required string Password { get; set; }

        /// <summary>
        /// Org slug to log into. If omitted, defaults to the public organization.
        /// </summary>
        [StringLength(200, ErrorMessage = "OrgSlug must not exceed 200 characters.")]
        public string? OrgSlug { get; set; }
    }
}
