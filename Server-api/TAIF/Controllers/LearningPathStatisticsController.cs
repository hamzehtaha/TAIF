using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LearningPathStatisticsController : TaifControllerBase
    {
        private readonly ILearningPathStatisticsService _statisticsService;

        public LearningPathStatisticsController(ILearningPathStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// Updates statistics for all learning paths in the system.
        /// </summary>
        /// <remarks>
        /// This endpoint recalculates and updates the following statistics for all learning paths:
        /// - Total enrollment count per learning path
        /// - Total duration in seconds (sum of all courses in all sections)
        /// 
        /// Only learning paths with changed statistics are updated to optimize performance.
        /// This is an administrative operation that should be run periodically to ensure data consistency.
        /// </remarks>
        /// <returns>Success response confirming the statistics update.</returns>
        /// <response code="200">Statistics updated successfully for all learning paths.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User does not have admin privileges.</response>
        [HttpPost("updateAll")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateAllLearningPathStatistics()
        {
            await _statisticsService.UpdateAllLearningPathStatisticsAsync();
            return Ok(ApiResponse<string>.SuccessResponse("Learning path statistics updated successfully"));
        }

        /// <summary>
        /// Updates statistics for a specific learning path.
        /// </summary>
        /// <remarks>
        /// This endpoint recalculates and updates the following statistics for the specified learning path:
        /// - Total enrollment count (number of users enrolled)
        /// - Total duration in seconds (sum of all courses across all sections)
        /// 
        /// This operation is useful when changes are made to a learning path's structure or when
        /// enrollment counts need to be synchronized.
        /// </remarks>
        /// <param name="learningPathId">The unique identifier of the learning path to update.</param>
        /// <returns>Success response confirming the statistics update.</returns>
        /// <response code="200">Statistics updated successfully for the specified learning path.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User does not have instructor, company, or admin privileges.</response>
        /// <response code="404">Learning path with the specified ID was not found.</response>
        [HttpPost("update/{learningPathId}")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> UpdateLearningPathStatistics([FromRoute] Guid learningPathId)
        {
            var result = await _statisticsService.UpdateLearningPathStatisticsAsync(learningPathId);
            if (!result) return NotFound();
            return Ok(ApiResponse<string>.SuccessResponse("Learning path statistics updated successfully"));
        }
    }
}