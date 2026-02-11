using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseStatisticsController : TaifControllerBase
    {
        private readonly ICourseStatisticsService _courseStatisticsService;

        public CourseStatisticsController(ICourseStatisticsService courseStatisticsService)
        {
            _courseStatisticsService = courseStatisticsService;
        }

        /// <summary>
        /// Updates statistics (TotalEnrolled, TotalDurationInSeconds) for all courses
        /// </summary>
        [HttpPost("updateAll")]
        [Authorize(Policy = "AdminOnly")] // Only admins can trigger full update
        public async Task<IActionResult> UpdateAllCourseStatistics()
        {
            await _courseStatisticsService.UpdateAllCourseStatisticsAsync();
            return Ok(ApiResponse<string>.SuccessResponse("Course statistics updated successfully"));
        }

        /// <summary>
        /// Updates statistics for a specific course
        /// </summary>
        [HttpPost("update/{courseId}")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> UpdateCourseStatistics([FromRoute] Guid courseId)
        {
            await _courseStatisticsService.UpdateCourseStatisticsAsync(courseId);
            return Ok(ApiResponse<string>.SuccessResponse($"Course statistics updated successfully"));
        }
    }
}