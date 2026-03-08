using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class UpdateLearningPathRequest
{
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 300 characters.")]
    public string? Name { get; set; }

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    [Url(ErrorMessage = "Photo must be a valid URL.")]
    [StringLength(2048, ErrorMessage = "Photo URL must not exceed 2048 characters.")]
    public string? Photo { get; set; }
}

public class UpdateLearningPathSectionRequest
{
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 300 characters.")]
    public string? Name { get; set; }

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Order must be zero or a positive number.")]
    public int? Order { get; set; }
}

public class UpdateLearningPathCourseRequest
{
    [Range(0, int.MaxValue, ErrorMessage = "Order must be zero or a positive number.")]
    public int? Order { get; set; }
    public bool? IsRequired { get; set; }
}
