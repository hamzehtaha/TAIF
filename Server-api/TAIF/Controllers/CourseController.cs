using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseController : TaifControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ITagService _tagService;

        public CourseController(ICourseService courseService, ITagService tagService)
        {
            _courseService = courseService;
            _tagService = tagService;
        }
        [AllowAnonymous]
        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _courseService.GetAllAsync();
            if (courses is null) return NotFound();
            
            // Filter by status: students and anonymous users only see published courses
            var isNonStudent = User.Identity?.IsAuthenticated == true && !IsStudent;
            if (!isNonStudent)
            {
                courses = courses.Where(c => c.Status == CourseStatus.Published).ToList();
            }
            
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] CourseFilter filter)
        {
            // Filter by status: students only see published courses, admins see all
            var isNonStudent = User.Identity?.IsAuthenticated == true && !IsStudent;
            
            Expression<Func<Course, bool>> predicate = c =>
                (string.IsNullOrWhiteSpace(filter.Search)
                    || c.Name!.Contains(filter.Search)
                    || c.Description!.Contains(filter.Search))
                && (!filter.CategoryId.HasValue
                    || c.CategoryId == filter.CategoryId)
                && (isNonStudent || c.Status == CourseStatus.Published);

            var result = await _courseService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: c => c.CreatedAt,
                orderByDescending: true,
                includes: c => c.Category
            );

            return Ok(ApiResponse<PagedResult<Course>>.SuccessResponse(result));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var course = await _courseService.GetByIdAsync(id);
            if (course is null) return NotFound();
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategoryId([FromRoute] Guid categoryId)
        {
            var courses = await _courseService.GetByCategoryIdAsync(categoryId);
            if (courses is null || courses.Count == 0) return NotFound();
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("recommended")]
        public async Task<IActionResult> GetRecommendedCourses([FromQuery] int limit = 10)
        {
            var courses = await _courseService.GetRecommendedCoursesAsync(this.UserId, limit);
            if (courses is null || courses.Count == 0) return NotFound();
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("my-courses")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> GetMyCourses()
        {
            var courses = await _courseService.GetByUserIdAsync(this.UserId);
            if (courses is null) return NotFound();
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("my-courses/count")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> GetMyCoursesCount()
        {
            var courses = await _courseService.GetByUserIdAsync(this.UserId);
            var count = courses?.Count ?? 0;
            return Ok(ApiResponse<int>.SuccessResponse(count));
        }

        [HttpPost("")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            await _tagService.TagsValidationGuard(request.Tags);
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo,
                CategoryId = request.CategoryId,
                Tags = request.Tags
            };
            var created_course = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<Course>.SuccessResponse(created_course));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCourseRequest request)
        {
            if (request.Tags is not null && request.Tags.Any())
                await _tagService.TagsValidationGuard(request.Tags);

            var course = await _courseService.UpdateAsync(id, request);
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _courseService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpPatch("{id}/status")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] UpdateCourseStatusRequest request)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = request.Status });
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpPost("{id}/publish")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Publish([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Published });
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpPost("{id}/archive")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Archive([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Archived });
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpPost("{id}/unpublish")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Unpublish([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Draft });
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }
    }
}
