using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var lesson = await _lessonService.GetByIdAsync(id);
            if (lesson is null) return NotFound();
            return Ok(ApiResponse<Lesson>.SuccessResponse(lesson));
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourseId([FromRoute] Guid courseId)
        {
            var lessons = await _lessonService.GetByCourseIdAsync(courseId);
            if (lessons is null) return NotFound();
            return Ok(ApiResponse<List<Lesson>>.SuccessResponse(lessons));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateLessonRequest request)
        {
            var lesson = new Lesson
            {
                Title = request.Title,
                CourseId = request.CourseId,
                Photo = request.Photo,
            };
            var created_lesson = await _lessonService.CreateAsync(lesson);
            return Ok(ApiResponse<Lesson>.SuccessResponse(created_lesson));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLessonRequest lesson)
        {
            var updatedLesson = await _lessonService.UpdateAsync(id, lesson);
            return Ok(ApiResponse<Lesson>.SuccessResponse(updatedLesson));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _lessonService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}