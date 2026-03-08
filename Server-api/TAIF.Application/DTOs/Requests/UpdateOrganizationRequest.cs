using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public class UpdateOrganizationRequest
    {
        [Required(ErrorMessage = "Organization name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Organization name must be between 2 and 200 characters.")]
        public string Name { get; set; } = null!;

        [Url(ErrorMessage = "Logo must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "Logo URL must not exceed 2048 characters.")]
        public string? Logo { get; set; }

        [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [StringLength(256, ErrorMessage = "Email must not exceed 256 characters.")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Phone must be a valid phone number.")]
        [StringLength(30, ErrorMessage = "Phone must not exceed 30 characters.")]
        public string? Phone { get; set; }

        public bool IsActive { get; set; } = true;
    }
}