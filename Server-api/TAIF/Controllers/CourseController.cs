using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : TaifControllerBase
    {
        private readonly ICourseService _courseService;
        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

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

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
        {
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo,
                CategoryId = request.CategoryId
            };
            var created_course = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<Course>.SuccessResponse(created_course));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCourseRequest course)
        {
            var Course = await _courseService.UpdateAsync(id, course);
            return Ok(ApiResponse<Course>.SuccessResponse(Course));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _courseService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
