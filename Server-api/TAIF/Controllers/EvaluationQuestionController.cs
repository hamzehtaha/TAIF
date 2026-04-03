using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EvaluationQuestionController : TaifControllerBase
    {
        private readonly IEvaluationQuestionService _service;
        private readonly IEvaluationAnswerService _answerService;
        private readonly IUserEvaluationService _userEvaluationService;

        public EvaluationQuestionController(
            IEvaluationQuestionService service,
            IEvaluationAnswerService answerService,
            IUserEvaluationService userEvaluationService)
        {
            _service = service;
            _answerService = answerService;
            _userEvaluationService = userEvaluationService;
        }

        /// <summary>
        /// Get all evaluation questions with answers
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllWithAnswersAsync();
            return Ok(ApiResponse<List<EvaluationQuestionResponseDto>>.SuccessResponse(result));
        }

        /// <summary>
        /// Get evaluation question by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var question = await _service.GetByIdAsync(id);
            if (question == null)
                return NotFound(ApiResponse<EvaluationQuestionResponseDto>.FailResponse("Question not found"));

            var answers = await _answerService.GetByQuestionIdAsync(id);
            var response = new EvaluationQuestionResponseDto
            {
                Id = question.Id,
                Text = question.Text,
                Answers = answers.Select(a => new EvaluationAnswerResponseDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    Score = a.Score
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationQuestionResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Create a new evaluation question with answers
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateEvaluationQuestionRequest request)
        {
            var question = new EvaluationQuestion
            {
                Text = request.Text
            };

            await _service.CreateAsync(question);

            if (request.Answers != null && request.Answers.Any())
            {
                foreach (var answerDto in request.Answers)
                {
                    var answer = new EvaluationAnswer
                    {
                        EvaluationQuestionId = question.Id,
                        Text = answerDto.Text,
                        Score = answerDto.Score
                    };
                    await _answerService.CreateAsync(answer);
                }
            }

            var answers = await _answerService.GetByQuestionIdAsync(question.Id);
            var response = new EvaluationQuestionResponseDto
            {
                Id = question.Id,
                Text = question.Text,
                Answers = answers.Select(a => new EvaluationAnswerResponseDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    Score = a.Score
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationQuestionResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Update an evaluation question
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEvaluationQuestionRequest request)
        {
            var question = await _service.GetByIdAsync(id);
            if (question == null)
                return NotFound(ApiResponse<EvaluationQuestionResponseDto>.FailResponse("Question not found"));

            if (request.Text != null)
                question.Text = request.Text;

            await _service.UpdateAsync(id, question);

            var answers = await _answerService.GetByQuestionIdAsync(id);
            var response = new EvaluationQuestionResponseDto
            {
                Id = question.Id,
                Text = question.Text,
                Answers = answers.Select(a => new EvaluationAnswerResponseDto
                {
                    Id = a.Id,
                    Text = a.Text,
                    Score = a.Score
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationQuestionResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Delete an evaluation question
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Question not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
