using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class CreateLearningPathRequest
{
    [Required]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Photo { get; set; }
    public List<CreateLearningPathSectionRequest>? Sections { get; set; }
}

public class CreateLearningPathSectionRequest
{
    [Required]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Order { get; set; }
    public List<CreateLearningPathCourseRequest>? Courses { get; set; }
}

public class CreateLearningPathCourseRequest
{
    [Required]
    public Guid CourseId { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; } = true;
}
