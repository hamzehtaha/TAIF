using Mapster;
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
        private readonly ICourseService _courseService;
        private readonly ISubscriptionService _subscriptionService;

        public EnrollmentController(IEnrollmentService service, ICourseService courseService, ISubscriptionService subscriptionService)
        {
            _service = service;
            _courseService = courseService;
            _subscriptionService = subscriptionService;
        }

        [HttpPost]
        public async Task<IActionResult> Enroll(EnrollRequest dto)
        {
            // Guard: students enrolling in a paid course must have CanAccessPaidCourses
            if (IsStudent)
            {
                var course = await _courseService.GetByIdAsync(dto.CourseId);
                if (course is null) return NotFound(new { message = "Course not found." });

                if (!course.IsFree)
                {
                    var canAccess = await _subscriptionService.HasFeatureAsync(UserId, PlanFeatureKey.CanAccessPaidCourses);
                    if (!canAccess)
                        return StatusCode(403, new { message = "Your current plan does not include access to paid courses. Please upgrade to enroll." });
                }
            }

            var enrollment = await _service.CreateAsync(
                new Enrollment
                {
                    UserId = this.UserId,
                    CourseId = dto.CourseId,
                    EnrolledAt = DateTime.UtcNow,
                }
            );

            return Ok(ApiResponse<EnrollmentResponse>.SuccessResponse(enrollment.Adapt<EnrollmentResponse>()));
        }

        [HttpGet("details/{courseId}")]
        public async Task<IActionResult> GetEnrollmentDetails([FromRoute] Guid courseId)
        {
            var enrollment = await _service.GetEnrollmentDetails(this.UserId, courseId);
            return Ok(ApiResponse<EnrollmentResponse>.SuccessResponse(enrollment.Adapt<EnrollmentResponse>()));
        }

        /// <summary>
        /// Gets enrollment details with total completed duration in seconds
        /// </summary>
        [HttpGet("details/{courseId}/progress")]
        public async Task<IActionResult> GetEnrollmentDetailsWithProgress([FromRoute] Guid courseId)
        {
            var enrollmentWithProgress = await _service.GetEnrollmentDetailsWithProgressAsync(this.UserId, courseId);
            return Ok(ApiResponse<EnrollmentDetailsResponse>.SuccessResponse(enrollmentWithProgress));
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserCourses()
        {
            var courses = await _service.GetUserCoursesAsync(this.UserId);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(
                courses.Select(c => c.Adapt<CourseResponse>()).ToList()));
        }
        
        [HttpGet("course/{courseId}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetCourseUsers([FromRoute] Guid courseId)
        {
            var users = await _service.GetCourseUsersAsync(courseId);
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(
                users.Select(u => u.Adapt<UserResponse>()).ToList()));
        }

        [HttpGet("favourite/course")]
        public async Task<IActionResult> GetUserFavouriteCourses()
        {
            var courses = await _service.GetUserFavouriteCourses(this.UserId);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(
                courses.Select(c => c.Adapt<CourseResponse>()).ToList()));
        }

        [HttpPut("toggleFavourite")]
        public async Task<IActionResult> ToggleCourseFavourite(ToggleFavoriteRequest dto)
        {
            var result = await _service.ToggleCourseFavourite(this.UserId, dto.CourseId);
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
