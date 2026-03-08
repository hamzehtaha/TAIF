using System.ComponentModel.DataAnnotations;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateCourseStatusRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        [EnumDataType(typeof(CourseStatus), ErrorMessage = "Status must be a valid course status.")]
        public CourseStatus Status { get; set; }
    }
}
