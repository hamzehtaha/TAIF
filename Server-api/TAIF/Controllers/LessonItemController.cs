using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonItemController : ControllerBase
    {
        private readonly ILessonItemService _lessonItemService;

        public LessonItemController(ILessonItemService lessonItemService)
        {
            _lessonItemService = lessonItemService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LessonItem>> Get([FromRoute] Guid id)
        {
            var lessonItem = await _lessonItemService.GetByIdAsync(id);
            if (lessonItem is null) return NotFound();
            return Ok(ApiResponse<LessonItem>.SuccessResponse(lessonItem));
        }

        [HttpGet("lesson/{lessonId}")]
        public async Task<ActionResult<List<LessonItem>>> GetByLessonId([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonItemService.GetByLessonIdAsync(lessonId);
            if (lessonItems is null) return NotFound();
            return Ok(ApiResponse<List<LessonItem>>.SuccessResponse(lessonItems));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateLessonItemRequest request)
        {
            var lessonItem = new LessonItem
            {
                Name = request.Name,
                URL = request.URL,
                Content = request.Content,
                Type = request.Type,
                LessonId = request.LessonId,
                DurationInSeconds = request.durationInSeconds
            };
            var created_lessonItem = await _lessonItemService.CreateAsync(lessonItem);
            return Ok(ApiResponse<LessonItem>.SuccessResponse(created_lessonItem));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLessonItemRequest lessonItem)
        {
            var updatedLessonItem = await _lessonItemService.UpdateAsync(id, lessonItem);
            return Ok(ApiResponse<LessonItem>.SuccessResponse(updatedLessonItem));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _lessonItemService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}