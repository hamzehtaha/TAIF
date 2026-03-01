using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Payloads;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LessonItemController : TaifControllerBase
    {
        private readonly ILessonItemService _lessonItemService;
        private readonly IQuizSubmissionService _quizSubmissionService;
        private readonly ILessonItemProgressService _lessonItemProgressService;
        private readonly ICourseService _courseService;
        private readonly ILessonLessonItemService _lessonLessonItemService;

        public LessonItemController(
            ILessonItemService lessonItemService,
            IQuizSubmissionService quizSubmissionService,
            ILessonItemProgressService lessonItemProgressService,
            ICourseService courseService,
            ILessonLessonItemService lessonLessonItemService)
        {
            _lessonItemService = lessonItemService;
            _quizSubmissionService = quizSubmissionService;
            _lessonItemProgressService = lessonItemProgressService;
            _courseService = courseService;
            _lessonLessonItemService = lessonLessonItemService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var lessonItem = await _lessonItemService.GetByIdWithContentAsync(id);
            if (lessonItem is null) return NotFound();

            var response = new LessonItemResponse
            {
                Id = lessonItem.Id,
                Name = lessonItem.Name,
                Description = lessonItem.Description,
                Type = lessonItem.Type,
                ContentId = lessonItem.ContentId,
                Content = lessonItem.Content != null
                    ? JsonSerializer.Deserialize<object>(lessonItem.Content.ContentJson)
                    : null,
                DurationInSeconds = lessonItem.DurationInSeconds,
                CreatedAt = lessonItem.CreatedAt,
                UpdatedAt = lessonItem.UpdatedAt
            };
            return Ok(ApiResponse<LessonItemResponse>.SuccessResponse(response));
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] LessonItemFilter filter)
        {
            var pagedResult = await _lessonItemService.GetPagedAsync(filter);
            return Ok(ApiResponse<PagedResult<LessonItem>>.SuccessResponse(pagedResult));
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
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateLessonItemRequest request)
        {
            var lessonItem = new LessonItem
            {
                Name = request.Name,
                Description = request.Description,
                ContentId = request.ContentId == Guid.Empty ? null : request.ContentId,
                Type = request.Type,
                DurationInSeconds = request.DurationInSeconds,
                OrganizationId = this.OrganizationId,
                SkillIds = request.SkillIds
            };
            var createdItem = await _lessonItemService.CreateAsync(lessonItem);

            if (request.LessonId != Guid.Empty)
            {
                await _lessonLessonItemService.AssignLessonItemToLessonAsync(request.LessonId, createdItem.Id);
            }

            return StatusCode(StatusCodes.Status201Created, ApiResponse<LessonItem>.SuccessResponse(createdItem));
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var lessonItems = await _lessonItemService.GetAllAsync();
            return Ok(ApiResponse<List<LessonItem>>.SuccessResponse(lessonItems.ToList()));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateLessonItemRequest lessonItem)
        {
            var updatedLessonItem = await _lessonItemService.UpdateAsync(id, lessonItem);
            return Ok(ApiResponse<LessonItem>.SuccessResponse(updatedLessonItem));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _lessonItemService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }

        // ============ QUIZ ENDPOINTS ============

        [HttpPost("submit-quiz")]
        public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizRequest request)
        {
            var result = await _lessonItemProgressService.SubmitQuizAsync(this.UserId, request);
            return Ok(ApiResponse<QuizResultResponse>.SuccessResponse(result));
        }

        [HttpGet("user-quiz-result/{lessonItemId}")]
        public async Task<IActionResult> GetUserQuizResult([FromRoute] Guid lessonItemId)
        {
            var submission = await _quizSubmissionService.GetUserSubmissionAsync(this.UserId, lessonItemId);
            if (submission == null)
                return NotFound(ApiResponse<QuizSubmissionResponse>.FailResponse("No submission found"));

            var lessonItem = await _lessonItemService.GetByIdWithContentAsync(lessonItemId);
            Quiz? quiz = null;

            if (lessonItem?.Content != null && !string.IsNullOrEmpty(lessonItem.Content.ContentJson))
                quiz = JsonSerializer.Deserialize<Quiz>(lessonItem.Content.ContentJson);

            var answers = JsonSerializer.Deserialize<List<QuizAnswerPayload>>(submission.AnswersJson)
                ?? new List<QuizAnswerPayload>();

            var response = new QuizSubmissionResponse
            {
                Id = submission.Id,
                UserId = submission.UserId,
                LessonItemId = submission.LessonItemId,
                Score = submission.Score,
                IsCompleted = submission.IsCompleted,
                Answers = answers,
                Quiz = quiz
            };

            return Ok(ApiResponse<QuizSubmissionResponse>.SuccessResponse(response));
        }
    }
}