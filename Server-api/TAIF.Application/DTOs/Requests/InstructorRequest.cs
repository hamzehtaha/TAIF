using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateInstructorRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 100 characters.")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 100 characters.")]
        public string LastName { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Bio must not exceed 2000 characters.")]
        public string? Bio { get; set; }

        public List<string>? Expertises { get; set; }

        [Range(0, 70, ErrorMessage = "Years of experience must be between 0 and 70.")]
        public int YearsOfExperience { get; set; }

        public Guid? OrganizationId { get; set; }
    }

    public class UpdateInstructorRequest
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 100 characters.")]
        public string? FirstName { get; set; }

        [StringLength(100, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 100 characters.")]
        public string? LastName { get; set; }

        [StringLength(2000, ErrorMessage = "Bio must not exceed 2000 characters.")]
        public string? Bio { get; set; }

        public List<string>? Expertises { get; set; }

        [Range(0, 70, ErrorMessage = "Years of experience must be between 0 and 70.")]
        public int? YearsOfExperience { get; set; }
    }
}
