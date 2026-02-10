using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TAIF.API.Controllers;
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
    public class LessonItemController : TaifControllerBase
    {
        private readonly ILessonItemService _lessonItemService;
        private readonly IQuizSubmissionService _quizSubmissionService;
        private readonly ILessonItemProgressService _lessonItemProgressService;

        public LessonItemController(ILessonItemService lessonItemService, IQuizSubmissionService quizSubmissionService, ILessonItemProgressService lessonItemProgressService)
        {
            _lessonItemService = lessonItemService;
            _quizSubmissionService = quizSubmissionService;
            _lessonItemProgressService = lessonItemProgressService;
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
            var lessonItems = await _lessonItemProgressService.GetLessonItemsProgressAsync(this.UserId, lessonId);
            if (lessonItems is null) return NotFound();
            return Ok(ApiResponse<List<LessonItemResponse>>.SuccessResponse(lessonItems));
        }
        [HttpGet("lesson/{lessonId}")]
        public async Task<IActionResult> GetByLessonId([FromRoute] Guid lessonId)
        {
            var lessonItems = await _lessonItemService.GetByLessonIdAsync(lessonId);
            if (lessonItems is null) return NotFound();
            return Ok(ApiResponse<List<LessonItemResponse>>.SuccessResponse(lessonItems));
        }
        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateLessonItemRequest request)
        {
            var lessonItem = new LessonItem
            {
                Name = request.Name,
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
        [HttpPost("submit-quiz")]
        public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizRequest request)
        {
            var result = await _lessonItemProgressService.SubmitQuizAsync(this.UserId,request);

            return Ok(ApiResponse<QuizResultResponse>.SuccessResponse(result));
        }
        [HttpGet("user-quiz-result/{lessonItemId}")]
        public async Task<IActionResult> GetUserQuizResult([FromRoute] Guid lessonItemId)
        {
            var result = await _quizSubmissionService.GetUserSubmissionAsync(this.UserId, lessonItemId);
            if (result is null)
            {
                return NotFound();
            }
            return Ok(ApiResponse<QuizSubmission>.SuccessResponse(result));
        }

    }
}