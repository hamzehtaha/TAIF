using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record UpdateCourseStatusRequest
    {
        public CourseStatus Status { get; set; }
    }
}
