using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

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

public class CreateLearningPathSectionRequest
{
    [Required(ErrorMessage = "Section name is required.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 300 characters.")]
    public string Name { get; set; } = null!;

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    public int Order { get; set; }

    public List<CreateLearningPathCourseRequest>? Courses { get; set; }
}

public class CreateLearningPathCourseRequest
{
    [Required(ErrorMessage = "Course ID is required.")]
    [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
    public Guid CourseId { get; set; }

    public int Order { get; set; }

    public bool IsRequired { get; set; } = true;
}
