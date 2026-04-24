using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using System.Text.Json;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
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
        private readonly IReviewService _reviewService;

        public CourseController(ICourseService courseService, ITagService tagService, IReviewService reviewService)
        {
            _courseService = courseService;
            _tagService = tagService;
            _reviewService = reviewService;
        }

        [AllowAnonymous]
        [HttpGet("")]
        public async Task<IActionResult> GetAll([FromQuery] bool? isFree = null)
        {
            var courses = await _courseService.GetAllAsync();
            if (courses is null) return NotFound();

            var isNonStudent = User.Identity?.IsAuthenticated == true && !IsStudent;
            if (!isNonStudent)
                courses = courses.Where(c => c.Status == CourseStatus.Published).ToList();

            if (isFree.HasValue)
                courses = courses.Where(c => c.IsFree == isFree.Value).ToList();

            var response = courses.Select(c => c.Adapt<CourseResponse>()).ToList();
            await EnrichWithReviewStatsAsync(response);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(response));
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] CourseFilter filter)
        {
            var isNonStudent = User.Identity?.IsAuthenticated == true && !IsStudent;

            Expression<Func<Course, bool>> predicate = c =>
                (string.IsNullOrWhiteSpace(filter.Search)
                    || c.Name!.Contains(filter.Search)
                    || c.Description!.Contains(filter.Search))
                && (!filter.CategoryId.HasValue
                    || c.CategoryId == filter.CategoryId)
                && (isNonStudent || c.Status == CourseStatus.Published)
                && (!filter.IsFree.HasValue || c.IsFree == filter.IsFree.Value);

            var result = await _courseService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: c => c.CreatedAt,
                orderByDescending: true,
                includes: c => c.Category
            );

            var items = result.Items.Select(c => c.Adapt<CourseResponse>()).ToList();
            await EnrichWithReviewStatsAsync(items);

            var response = new PagedResult<CourseResponse>
            {
                Items = items,
                Page = result.Page,
                PageSize = result.PageSize,
                TotalCount = result.TotalCount
            };

            return Ok(ApiResponse<PagedResult<CourseResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var course = await _courseService.GetByIdAsync(id);
            if (course is null) return NotFound();

            // Students only see published courses
            if (IsStudent && course.Status != CourseStatus.Published)
                return NotFound();

            var response = course.Adapt<CourseResponse>();
            await EnrichWithReviewStatsAsync([response]);
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(response));
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategoryId([FromRoute] Guid categoryId)
        {
            var courses = await _courseService.GetByCategoryIdAsync(categoryId);
            if (courses is null || courses.Count == 0) return NotFound();

            // Students only see published courses
            if (IsStudent)
                courses = courses.Where(c => c.Status == CourseStatus.Published).ToList();

            if (courses.Count == 0) return NotFound();
            var response = courses.Select(c => c.Adapt<CourseResponse>()).ToList();
            await EnrichWithReviewStatsAsync(response);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(response));
        }

        [HttpGet("recommended")]
        public async Task<IActionResult> GetRecommendedCourses([FromQuery] int limit = 10)
        {
            var courses = await _courseService.GetRecommendedCoursesAsync(this.UserId, limit);
            if (courses is null || courses.Count == 0) return NotFound();
            var response = courses.Select(c => c.Adapt<CourseResponse>()).ToList();
            await EnrichWithReviewStatsAsync(response);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(response));
        }

        [HttpGet("my-courses")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> GetMyCourses()
        {
            var courses = await _courseService.GetByUserIdAsync(this.UserId);
            if (courses is null) return NotFound();
            var response = courses.Select(c => c.Adapt<CourseResponse>()).ToList();
            await EnrichWithReviewStatsAsync(response);
            return Ok(ApiResponse<List<CourseResponse>>.SuccessResponse(response));
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

            var course = request.Adapt<Course>();

            var created_course = await _courseService.CreateAsync(course);
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(created_course.Adapt<CourseResponse>()));
        }

        /// <summary>
        /// Creates a complete course with all lessons, lesson items, and content in a single operation.
        /// Used by the Course Builder to submit all data at once.
        /// </summary>
        [HttpPost("full")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> CreateFullCourse([FromBody] CreateFullCourseRequest request)
        {
            if (request.Tags != null && request.Tags.Any())
                await _tagService.TagsValidationGuard(request.Tags);

            var result = await _courseService.CreateFullCourseAsync(request, UserId);
            return Ok(ApiResponse<CreateFullCourseResponse>.SuccessResponse(result));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCourseRequest request)
        {
            if (request.Tags is not null && request.Tags.Any())
                await _tagService.TagsValidationGuard(request.Tags);

            var course = await _courseService.UpdateAsync(id, request);
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(course.Adapt<CourseResponse>()));
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
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(course.Adapt<CourseResponse>()));
        }

        [HttpPost("{id}/publish")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Publish([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Published });
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(course.Adapt<CourseResponse>()));
        }

        [HttpPost("{id}/archive")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Archive([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Archived });
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(course.Adapt<CourseResponse>()));
        }

        [HttpPost("{id}/unpublish")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Unpublish([FromRoute] Guid id)
        {
            var course = await _courseService.UpdateAsync(id, new { Status = Enums.CourseStatus.Draft });
            return Ok(ApiResponse<CourseResponse>.SuccessResponse(course.Adapt<CourseResponse>()));
        }

        private async Task EnrichWithReviewStatsAsync(IEnumerable<CourseResponse> courses)
        {
            var ids = courses.Select(c => c.Id).ToList();
            if (ids.Count == 0) return;

            var stats = await _reviewService.GetReviewStatsForCoursesAsync(ids);
            foreach (var course in courses)
            {
                if (stats.TryGetValue(course.Id, out var s))
                {
                    course.Rating = s.AverageRating;
                    course.ReviewCount = s.ReviewCount;
                }
            }
        }
    }
}
