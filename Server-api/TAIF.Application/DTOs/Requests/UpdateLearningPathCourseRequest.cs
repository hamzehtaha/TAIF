using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class UpdateLearningPathCourseRequest
{
    [Range(0, int.MaxValue, ErrorMessage = "Order must be zero or a positive number.")]
    public int? Order { get; set; }
    public bool? IsRequired { get; set; }
}
