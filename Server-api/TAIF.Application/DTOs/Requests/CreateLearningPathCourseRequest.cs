using System.ComponentModel.DataAnnotations;
using TAIF.Application.DTOs.Validation;

namespace TAIF.Application.DTOs.Requests;

public class CreateLearningPathCourseRequest
{
    [Required(ErrorMessage = "Course ID is required.")]
    [NonEmptyGuid(ErrorMessage = "Course ID must not be an empty GUID.")]
    public Guid CourseId { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Order must be zero or a positive number.")]
    public int Order { get; set; }

    public bool IsRequired { get; set; } = true;
}
