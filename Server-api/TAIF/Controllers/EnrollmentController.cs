using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/enrollments")]
    [Authorize]
    public class EnrollmentController : TaifControllerBase
    {
        private readonly IEnrollmentService _service;

        public EnrollmentController(IEnrollmentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Enroll(EnrollRequest dto)
        {
            var enrollment = await _service.CreateAsync(
                new Enrollment
                {
                    UserId = this.UserId,
                    CourseId = dto.CourseId,
                    EnrolledAt = DateTime.UtcNow,
                }
            );

            return Ok(ApiResponse<Enrollment>.SuccessResponse(enrollment));
        }

        [HttpGet("details/{courseId}")]
        public async Task<IActionResult> GetEnrollmentDetails([FromRoute] Guid courseId)
        {
            var enrollment = await _service.GetEnrollmentDetailsAsync(this.UserId, courseId);
            
            if (enrollment == null)
            {
                return NotFound(ApiResponse<Enrollment>.FailResponse("Enrollment not found"));
            }
            
            return Ok(ApiResponse<Enrollment>.SuccessResponse(enrollment));
        }

        [HttpGet("details-with-progress/{courseId}")]
        public async Task<IActionResult> GetEnrollmentDetailsWithProgress([FromRoute] Guid courseId)
        {
            var enrollmentWithProgress = await _service.GetEnrollmentDetailsWithProgressAsync(this.UserId, courseId);
            
            if (enrollmentWithProgress == null)
            {
                return NotFound(ApiResponse<EnrollmentDetailsResponse>.FailResponse("Enrollment not found"));
            }
            
            return Ok(ApiResponse<EnrollmentDetailsResponse>.SuccessResponse(enrollmentWithProgress));
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserCourses()
        {
            var courses = await _service.GetUserCoursesAsync(this.UserId);
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }
        
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseUsers([FromRoute] Guid courseId)
        {
            var users = await _service.GetCourseUsersAsync(courseId);
            return Ok(ApiResponse<List<User>>.SuccessResponse(users));
        }

        [HttpGet("favourite/course")]
        public async Task<IActionResult> GetUserFavouriteCourses()
        {
            var courses = await _service.GetUserFavouriteCourses(this.UserId);
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpPut("toggleFavourite")]
        public async Task<IActionResult> ToggleCourseFavourite(ToggleFavoriteRequest dto)
        {
            var result = await _service.ToggleCourseFavourite(this.UserId, dto.CourseId);
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
