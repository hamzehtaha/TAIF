using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LessonController : TaifControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ICourseService _courseService;

        public LessonController(ILessonService lessonService, ICourseService courseService)
        {
            _lessonService = lessonService;
            _courseService = courseService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var lesson = await _lessonService.GetByIdAsync(id);
            if (lesson is null) return NotFound();
            return Ok(ApiResponse<Lesson>.SuccessResponse(lesson));
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

            return Ok(ApiResponse<PagedResult<Lesson>>.SuccessResponse(result));
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourseId([FromRoute] Guid courseId)
        {
            var lessons = await _lessonService.GetByCourseIdAsync(courseId);
            if (lessons is null) return NotFound();
            return Ok(ApiResponse<List<Lesson>>.SuccessResponse(lessons));
        }

        [HttpPost("")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequest request)
        {
            var lesson = new Lesson
            {
                Title = request.Title,
                Description = request.Description,
                Photo = request.Photo,
                InstructorId = request.InstructorId,
                CreatedByUserId = this.UserId,
                OrganizationId = this.OrganizationId
            };
            var created_lesson = await _lessonService.CreateAsync(lesson);
            return Ok(ApiResponse<Lesson>.SuccessResponse(created_lesson));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLessonRequest lesson)
        {
            var updatedLesson = await _lessonService.UpdateAsync(id, lesson);
            return Ok(ApiResponse<Lesson>.SuccessResponse(updatedLesson));
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
            return Ok(ApiResponse<List<Lesson>>.SuccessResponse(lessons));
        }
    }
}