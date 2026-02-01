using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TAIF.API.Controllers;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonItemController : TaifControllerBase
    {
        private readonly ILessonItemService _lessonItemService;

        public LessonItemController(ILessonItemService lessonItemService)
        {
            _lessonItemService = lessonItemService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var lessonItem = await _lessonItemService.GetByIdAsync(id);
            if (lessonItem is null) return NotFound();
            return Ok(ApiResponse<LessonItem>.SuccessResponse(lessonItem));
        }

        [HttpGet("lessonProgress/{lessonId}")]
        public async Task<IActionResult> GetLessonItemsProgressAsync([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonItemService.GetLessonItemsProgressAsync(this.UserId, lessonId);
            if (lessonItems is null) return NotFound();
            return Ok(ApiResponse<List<LessonItemResponse>>.SuccessResponse(lessonItems));
        }

        [HttpGet("lesson/{lessonId}")]
        public async Task<IActionResult> GetByLessonId([FromRoute] Guid lessonId)
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
                //URL = request.URL,
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

        private void ValidateLessonItem(LessonItemType type, string content, double duration)
        {
            using var doc = JsonDocument.Parse(content);

            switch (type)
            {
                case LessonItemType.Video:
                    if (!doc.RootElement.TryGetProperty("url", out _))
                        throw new Exception("Video content must contain 'url'");

                    if (duration <= 0)
                        throw new Exception("Video duration is required");
                    break;

                case LessonItemType.RichText:
                    if (!doc.RootElement.TryGetProperty("html", out _) &&
                        !doc.RootElement.TryGetProperty("markdown", out _))
                        throw new Exception("Text content must contain 'html' or 'markdown'");
                    break;

                case LessonItemType.Question:
                    if (!doc.RootElement.TryGetProperty("questions", out _))
                        throw new Exception("Quiz content must contain questions");
                    break;
            }
        }

    }
}