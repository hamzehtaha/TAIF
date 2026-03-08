using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests
{
    public class CreateSkillRequest
    {
        [Required(ErrorMessage = "Skill name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Skill name must be between 2 and 200 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters.")]
        public string? Description { get; set; }
    }

    public class UpdateSkillRequest
    {
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Skill name must be between 2 and 200 characters.")]
        public string? Name { get; set; }

        [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters.")]
        public string? Description { get; set; }
    }
}
