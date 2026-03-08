using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LessonController : TaifControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ICourseService _courseService;
        private readonly ICourseLessonService _courseLessonService;

        public LessonController(ILessonService lessonService, ICourseService courseService, ICourseLessonService courseLessonService)
        {
            _lessonService = lessonService;
            _courseService = courseService;
            _courseLessonService = courseLessonService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var lesson = await _lessonService.GetByIdAsync(id);
            if (lesson is null) return NotFound();
            return Ok(ApiResponse<LessonResponse>.SuccessResponse(lesson.Adapt<LessonResponse>()));
        }

        [HttpGet("paged")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> GetPaged([FromQuery] LessonFilter filter)
        {
            Expression<Func<Lesson, bool>> predicate = l =>
                (string.IsNullOrWhiteSpace(filter.Search) || l.Title.Contains(filter.Search));

            var result = await _lessonService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: l => l.CreatedAt,
                orderByDescending: true
            );

            var response = new PagedResult<LessonResponse>
            {
                Items = result.Items.Select(l => l.Adapt<LessonResponse>()).ToList(),
                Page = result.Page,
                PageSize = result.PageSize,
                TotalCount = result.TotalCount
            };

            return Ok(ApiResponse<PagedResult<LessonResponse>>.SuccessResponse(response));
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourseId([FromRoute] Guid courseId)
        {
            var courseLessons = await _courseLessonService.GetByCourseIdAsync(courseId);
            if (courseLessons is null) return NotFound();

            var response = courseLessons.Select(cl =>
            {
                var r = cl.Lesson.Adapt<LessonResponse>();
                r.CourseId = courseId;
                r.Order = cl.Order;
                return r;
            }).ToList();

            return Ok(ApiResponse<List<LessonResponse>>.SuccessResponse(response));
        }

        [HttpPost("")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequest request)
        {
            var lesson = request.Adapt<Lesson>();

            var created_lesson = await _lessonService.CreateAsync(lesson);
            return Ok(ApiResponse<LessonResponse>.SuccessResponse(created_lesson.Adapt<LessonResponse>()));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLessonRequest lesson)
        {
            var updatedLesson = await _lessonService.UpdateAsync(id, lesson);
            return Ok(ApiResponse<LessonResponse>.SuccessResponse(updatedLesson.Adapt<LessonResponse>()));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _lessonService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        [HttpGet("")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> GetAll()
        {
            var lessons = await _lessonService.GetAllAsync();
            return Ok(ApiResponse<List<LessonResponse>>.SuccessResponse(
                lessons.Select(l => l.Adapt<LessonResponse>()).ToList()));
        }
    }
}