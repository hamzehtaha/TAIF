using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class CreateLearningPathRequest
{
    [Required(ErrorMessage = "Learning path name is required.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 300 characters.")]
    public string Name { get; set; } = null!;

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    [Url(ErrorMessage = "Photo must be a valid URL.")]
    [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
    public string? Photo { get; set; }

    public List<CreateLearningPathSectionRequest>? Sections { get; set; }
}
