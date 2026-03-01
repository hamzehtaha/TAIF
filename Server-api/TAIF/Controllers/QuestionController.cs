using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestionController : TaifControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var questions = await _questionService.GetAllAsync();

            var response = questions.Select(q => new QuestionResponse
            {
                Id = q.Id,
                Info = q.Info,
                Goals = q.Goals,
                AnswerIds = q.AnswerIds,
                CorrectAnswerIndex = q.CorrectAnswerIndex,
                MinPercentage = q.MinPercentage,
                SkillIds = q.SkillIds,
                OrganizationId = q.OrganizationId
            }).ToList();

            return Ok(ApiResponse<List<QuestionResponse>>.SuccessResponse(response));
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var question = await _questionService.GetByIdAsync(id);

            if (question == null)
                return NotFound(ApiResponse<QuestionResponse>.FailResponse("Question not found"));

            var response = new QuestionResponse
            {
                Id = question.Id,
                Info = question.Info,
                Goals = question.Goals,
                AnswerIds = question.AnswerIds,
                CorrectAnswerIndex = question.CorrectAnswerIndex,
                MinPercentage = question.MinPercentage,
                SkillIds = question.SkillIds
            };

            return Ok(ApiResponse<QuestionResponse>.SuccessResponse(response));
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateQuestionRequest request)
        {
            var question = new Question
            {
                Info = request.Info,
                Goals = request.Goals,
                AnswerIds = request.AnswerIds ?? new List<Guid>(),
                CorrectAnswerIndex = request.CorrectAnswerIndex,
                MinPercentage = request.MinPercentage,
                SkillIds = request.SkillIds ?? new List<Guid>(),
                OrganizationId = this.OrganizationId
            };

            await _questionService.CreateAsync(question);

            var response = new QuestionResponse
            {
                Id = question.Id,
                Info = question.Info,
                Goals = question.Goals,
                AnswerIds = question.AnswerIds,
                CorrectAnswerIndex = question.CorrectAnswerIndex,
                MinPercentage = question.MinPercentage,
                SkillIds = question.SkillIds
            };

            return Ok(ApiResponse<QuestionResponse>.SuccessResponse(response));
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateQuestionRequest request)
        {
            var question = await _questionService.GetByIdAsync(id);

            if (question == null)
                return NotFound(ApiResponse<QuestionResponse>.FailResponse("Question not found"));

            if (request.Info != null) question.Info = request.Info;
            if (request.Goals != null) question.Goals = request.Goals;
            if (request.AnswerIds != null) question.AnswerIds = request.AnswerIds;
            if (request.SkillIds != null) question.SkillIds = request.SkillIds;
            if (request.MinPercentage.HasValue) question.MinPercentage = request.MinPercentage.Value;

            // Important validation
            if (request.CorrectAnswerIndex.HasValue)
            {
                if (question.AnswerIds == null ||
                    request.CorrectAnswerIndex.Value < 0 ||
                    request.CorrectAnswerIndex.Value >= question.AnswerIds.Count)
                {
                    return BadRequest(ApiResponse<QuestionResponse>
                        .FailResponse("Invalid CorrectAnswerIndex"));
                }

                question.CorrectAnswerIndex = request.CorrectAnswerIndex.Value;
            }

            await _questionService.UpdateAsync(id, question);

            var response = new QuestionResponse
            {
                Id = question.Id,
                Info = question.Info,
                Goals = question.Goals,
                AnswerIds = question.AnswerIds,
                CorrectAnswerIndex = question.CorrectAnswerIndex,
                MinPercentage = question.MinPercentage,
                SkillIds = question.SkillIds
            };

            return Ok(ApiResponse<QuestionResponse>.SuccessResponse(response));
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _questionService.DeleteAsync(id);

            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Question not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
