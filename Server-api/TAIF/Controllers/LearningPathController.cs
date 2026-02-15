using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LearningPathController : TaifControllerBase
    {
        private readonly ILearningPathService _learningPathService;
        private readonly IUserLearningPathProgressService _progressService;

        public LearningPathController(
            ILearningPathService learningPathService,
            IUserLearningPathProgressService progressService)
        {
            _learningPathService = learningPathService;
            _progressService = progressService;
        }

        /// <summary>
        /// Retrieves all available learning paths with enrollment status for the current user.
        /// </summary>
        /// <remarks>
        /// Returns a list of all learning paths including:
        /// - Basic information (name, description, photo)
        /// - Statistics (total enrolled users, duration, number of sections and courses)
        /// - User-specific enrollment status (IsEnrolled flag)
        /// </remarks>
        /// <returns>A list of all learning paths with their basic information and enrollment status.</returns>
        /// <response code="200">Successfully retrieved all learning paths.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var learningPaths = await _learningPathService.GetAllLearningPathsAsync(this.UserId);
            return Ok(ApiResponse<List<LearningPathResponseDTO>>.SuccessResponse(learningPaths));
        }

        /// <summary>
        /// Retrieves a paginated list of learning paths with optional search filtering.
        /// </summary>
        /// <remarks>
        /// Supports pagination and search functionality. Search is performed across:
        /// - Learning path name
        /// - Learning path description
        /// 
        /// Results are ordered by creation date in descending order (newest first).
        /// </remarks>
        /// <param name="filter">Filter criteria including page number, page size, and optional search term.</param>
        /// <returns>A paginated result containing learning paths matching the filter criteria.</returns>
        /// <response code="200">Successfully retrieved paginated learning paths.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] LearningPathFilter filter)
        {
            Expression<Func<LearningPath, bool>> predicate = lp =>
                (string.IsNullOrWhiteSpace(filter.Search)
                    || lp.Name.Contains(filter.Search)
                    || (lp.Description != null && lp.Description.Contains(filter.Search)));

            var result = await _learningPathService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: lp => lp.CreatedAt,
                orderByDescending: true
            );

            return Ok(ApiResponse<PagedResult<LearningPath>>.SuccessResponse(result));
        }

        /// <summary>
        /// Retrieves all learning paths that the current user is enrolled in.
        /// </summary>
        /// <remarks>
        /// Returns only the learning paths where the user has an active enrollment.
        /// Each learning path includes:
        /// - Basic information (name, description, photo)
        /// - Statistics (total enrolled users, duration, number of sections and courses)
        /// - IsEnrolled flag (always true for this endpoint)
        /// </remarks>
        /// <returns>A list of learning paths the user is enrolled in.</returns>
        /// <response code="200">Successfully retrieved user's enrolled learning paths.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpGet("user")]
        public async Task<IActionResult> GetUserLearningPaths()
        {
            var learningPaths = await _progressService.GetUserEnrolledLearningPathsAsync(this.UserId);
            return Ok(ApiResponse<List<LearningPathResponseDTO>>.SuccessResponse(learningPaths));
        }

        /// <summary>
        /// Retrieves detailed information about a specific learning path.
        /// </summary>
        /// <remarks>
        /// Returns comprehensive details including:
        /// - Basic information (name, description, photo, statistics)
        /// - User's enrollment status
        /// - Complete structure: sections and courses within each section
        /// - Course details (name, description, photo, duration, order, required status)
        /// </remarks>
        /// <param name="id">The unique identifier of the learning path.</param>
        /// <returns>Detailed information about the specified learning path.</returns>
        /// <response code="200">Successfully retrieved learning path details.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="404">Learning path with the specified ID was not found.</response>
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetDetails([FromRoute] Guid id)
        {
            var details = await _learningPathService.GetLearningPathDetailsAsync(id, this.UserId);
            if (details is null) return NotFound();
            return Ok(ApiResponse<LearningPathDetailsResponseDTO>.SuccessResponse(details));
        }

        /// <summary>
        /// Retrieves a learning path with the current user's progress information.
        /// </summary>
        /// <remarks>
        /// Returns detailed progress tracking including:
        /// - Learning path structure (sections and courses)
        /// - User's completed duration (in seconds) for progress percentage calculation
        /// - Current position (current section and course)
        /// - Per-course enrollment status and current course indicator
        /// - Enrollment timestamp
        /// 
        /// Progress percentage can be calculated as: (CompletedDuration / DurationInSeconds) * 100
        /// </remarks>
        /// <param name="id">The unique identifier of the learning path.</param>
        /// <returns>Learning path information with detailed user progress.</returns>
        /// <response code="200">Successfully retrieved learning path with progress.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="404">Learning path was not found or user is not enrolled.</response>
        [HttpGet("{id}/progress")]
        public async Task<IActionResult> GetWithProgress([FromRoute] Guid id)
        {
            var progress = await _progressService.GetLearningPathWithProgressAsync(id, this.UserId);
            if (progress is null) return NotFound();
            return Ok(ApiResponse<LearningPathProgressResponseDTO>.SuccessResponse(progress));
        }

        /// <summary>
        /// Checks the current user's enrollment status for a specific learning path.
        /// </summary>
        /// <remarks>
        /// Returns enrollment information including:
        /// - Whether the user is currently enrolled (IsEnrolled flag)
        /// - Enrollment timestamp (if enrolled)
        /// 
        /// This is a lightweight endpoint to check enrollment without fetching full details.
        /// </remarks>
        /// <param name="id">The unique identifier of the learning path.</param>
        /// <returns>Enrollment status information for the current user.</returns>
        /// <response code="200">Successfully retrieved enrollment status.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpGet("{id}/enrollment")]
        public async Task<IActionResult> GetEnrollmentStatus([FromRoute] Guid id)
        {
            var status = await _progressService.GetEnrollmentStatusAsync(this.UserId, id);
            return Ok(ApiResponse<EnrollmentStatusResponseDTO>.SuccessResponse(status));
        }

        /// <summary>
        /// Enrolls the current user in a specific learning path.
        /// </summary>
        /// <remarks>
        /// Creates a new enrollment record for the user in the specified learning path.
        /// 
        /// Initial enrollment state:
        /// - EnrolledAt: Current UTC timestamp
        /// - CompletedDuration: 0
        /// - CurrentSectionId: null
        /// - CurrentCourseId: null
        /// 
        /// Note: User cannot enroll in the same learning path twice.
        /// </remarks>
        /// <param name="id">The unique identifier of the learning path to enroll in.</param>
        /// <returns>The created enrollment progress record.</returns>
        /// <response code="200">Successfully enrolled in the learning path.</response>
        /// <response code="400">User is already enrolled in this learning path or learning path does not exist.</response>
        /// <response code="401">User is not authenticated.</response>
        [HttpPost("{id}/enroll")]
        public async Task<IActionResult> Enroll([FromRoute] Guid id)
        {
            var enrollment = await _progressService.EnrollUserAsync(this.UserId, id);
            return Ok(ApiResponse<UserLearningPathProgress>.SuccessResponse(enrollment));
        }
    }
}