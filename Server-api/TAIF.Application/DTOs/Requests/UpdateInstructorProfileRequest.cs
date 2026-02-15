using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateInstructorProfileRequest
    {
        [StringLength(100, MinimumLength = 2)]
        public string? FirstName { get; set; }

        [StringLength(100, MinimumLength = 2)]
        public string? LastName { get; set; }

        [StringLength(1000)]
        public string? Bio { get; set; }

        public List<string>? Expertises { get; set; }

        [Range(0, 50)]
        public int? YearsOfExperience { get; set; }
    }
}