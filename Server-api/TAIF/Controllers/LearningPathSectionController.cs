using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/learning-path")]
    [Authorize(Policy = "ContentCreatorOrAbove")]
    public class LearningPathSectionController : TaifControllerBase
    {
        private readonly ILearningPathSectionService _sectionService;
        private readonly ILearningPathCourseService _courseService;

        public LearningPathSectionController(
            ILearningPathSectionService sectionService,
            ILearningPathCourseService courseService)
        {
            _sectionService = sectionService;
            _courseService = courseService;
        }

        #region Section Operations

        [HttpGet("{learningPathId}/sections")]
        public async Task<IActionResult> GetSections([FromRoute] Guid learningPathId)
        {
            var sections = await _sectionService.FindNoTrackingAsync(
                s => s.LearningPathId == learningPathId,
                orderBy: s => s.Order);
            return Ok(ApiResponse<List<LearningPathSection>>.SuccessResponse(sections));
        }

        [HttpGet("sections/{sectionId}")]
        public async Task<IActionResult> GetSection([FromRoute] Guid sectionId)
        {
            var section = await _sectionService.GetByIdAsync(sectionId);
            if (section is null) return NotFound();
            return Ok(ApiResponse<LearningPathSection>.SuccessResponse(section));
        }

        [HttpPost("{learningPathId}/sections")]
        public async Task<IActionResult> CreateSection(
            [FromRoute] Guid learningPathId,
            [FromBody] CreateLearningPathSectionRequest request)
        {
            var section = new LearningPathSection
            {
                LearningPathId = learningPathId,
                Name = request.Name,
                Description = request.Description,
                Order = request.Order,
                OrganizationId = this.OrganizationId
            };

            var created = await _sectionService.CreateAsync(section);
            return Ok(ApiResponse<LearningPathSection>.SuccessResponse(created));
        }

        [HttpPut("sections/{sectionId}")]
        public async Task<IActionResult> UpdateSection(
            [FromRoute] Guid sectionId,
            [FromBody] UpdateLearningPathSectionRequest request)
        {
            var updated = await _sectionService.UpdateAsync(sectionId, request);
            return Ok(ApiResponse<LearningPathSection>.SuccessResponse(updated));
        }

        [HttpDelete("sections/{sectionId}")]
        public async Task<IActionResult> DeleteSection([FromRoute] Guid sectionId)
        {
            var result = await _sectionService.DeleteAsync(sectionId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }

        #endregion

        #region Course Operations

        [HttpGet("sections/{sectionId}/courses")]
        public async Task<IActionResult> GetCourses([FromRoute] Guid sectionId)
        {
            var courses = await _courseService.FindNoTrackingAsync(
                c => c.LearningPathSectionId == sectionId,
                orderBy: c => c.Order);
            return Ok(ApiResponse<List<LearningPathCourse>>.SuccessResponse(courses));
        }

        [HttpPost("sections/{sectionId}/courses")]
        public async Task<IActionResult> AddCourse(
            [FromRoute] Guid sectionId,
            [FromBody] CreateLearningPathCourseRequest request)
        {
            var course = new LearningPathCourse
            {
                LearningPathSectionId = sectionId,
                CourseId = request.CourseId,
                Order = request.Order,
                IsRequired = request.IsRequired,
                OrganizationId = this.OrganizationId
            };

            var created = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<LearningPathCourse>.SuccessResponse(created));
        }

        [HttpPut("sections/courses/{courseId}")]
        public async Task<IActionResult> UpdateCourse(
            [FromRoute] Guid courseId,
            [FromBody] UpdateLearningPathCourseRequest request)
        {
            var updated = await _courseService.UpdateAsync(courseId, request);
            return Ok(ApiResponse<LearningPathCourse>.SuccessResponse(updated));
        }

        [HttpDelete("sections/courses/{courseId}")]
        public async Task<IActionResult> RemoveCourse([FromRoute] Guid courseId)
        {
            var result = await _courseService.DeleteAsync(courseId);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }

        #endregion
    }
}
