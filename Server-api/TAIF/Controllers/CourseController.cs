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
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] CourseFilter filter)
        {
            Expression<Func<Course, bool>> predicate = c =>
                (string.IsNullOrWhiteSpace(filter.Search)
                    || c.Name!.Contains(filter.Search)
                    || c.Description!.Contains(filter.Search))
                && (!filter.CategoryId.HasValue
                    || c.CategoryId == filter.CategoryId);

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
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> GetMyCourses()
        {
            var courses = await _courseService.GetByUserIdAsync(this.UserId);
            if (courses is null) return NotFound();
            return Ok(ApiResponse<List<Course>>.SuccessResponse(courses));
        }

        [HttpGet("my-courses/count")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> GetMyCoursesCount()
        {
            var courses = await _courseService.GetByUserIdAsync(this.UserId);
            var count = courses?.Count ?? 0;
            return Ok(ApiResponse<int>.SuccessResponse(count));
        }

        [HttpPost("")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            await _tagService.TagsValidationGuard(request.Tags);
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo,
                CategoryId = request.CategoryId,
                Tags = request.Tags,
                UserId = this.UserId
            };
            var created_course = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<Course>.SuccessResponse(created_course));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCourseRequest request)
        {
            if (request.Tags is not null && request.Tags.Any())
                await _tagService.TagsValidationGuard(request.Tags);

            var course = await _courseService.UpdateAsync(id, request);
            return Ok(ApiResponse<Course>.SuccessResponse(course));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "InstructorOrCompanyOrAdmin")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _courseService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
