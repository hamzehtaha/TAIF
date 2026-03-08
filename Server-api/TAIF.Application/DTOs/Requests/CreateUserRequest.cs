using System.ComponentModel.DataAnnotations;
using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 100 characters.")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 100 characters.")]
        public string LastName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [StringLength(256, ErrorMessage = "Email must not exceed 256 characters.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters.")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Role is required.")]
        [EnumDataType(typeof(UserRoleType), ErrorMessage = "Role must be a valid user role.")]
        public UserRoleType Role { get; set; }

        public DateOnly? Birthday { get; set; }
    }
}
