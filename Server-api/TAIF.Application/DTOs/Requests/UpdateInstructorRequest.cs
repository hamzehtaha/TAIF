using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
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
