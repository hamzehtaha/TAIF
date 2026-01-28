using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/enrollments")]
    [Authorize]
    public class EnrollmentController : ControllerBase
    {
        private readonly IEnrollmentService _service;
        public EnrollmentController(IEnrollmentService service)
        {
            _service = service;
        }
        [HttpPost]
        public async Task<IActionResult> Enroll(Guid courseId)
        {
            var userId = GetUserId();
            var enrollment = await _service.CreateAsync(
                new Enrollment
                {
                    UserId = userId,
                    CourseId = courseId,
                    EnrolledAt = DateTime.UtcNow,
                }
            );

            return Ok(ApiResponse<Enrollment>.SuccessResponse(enrollment));
        }
        [HttpGet("user")]
        public async Task<IActionResult> GetUserCourses()
        {
            var userId = GetUserId();
            var courses = await _service.GetUserCoursesAsync(userId);
            return Ok(courses);
        }
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseUsers(Guid courseId)
        {
            var users = await _service.GetCourseUsersAsync(courseId);
            return Ok(users);
        }
        private Guid GetUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdValue))
                throw new UnauthorizedAccessException("UserId claim missing");

            if (!Guid.TryParse(userIdValue, out var userId))
                throw new UnauthorizedAccessException("Invalid UserId claim");

            return userId;
        }

    }

}
