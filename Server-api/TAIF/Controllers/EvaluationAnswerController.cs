using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EvaluationAnswerController : TaifControllerBase
    {
        private readonly IEvaluationAnswerService _service;

        public EvaluationAnswerController(IEvaluationAnswerService service)
        {
            _service = service;
        }

        /// <summary>
        /// Get all answers for a specific question
        /// </summary>
        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetByQuestionId(Guid questionId)
        {
            var answers = await _service.GetByQuestionIdAsync(questionId);
            var response = answers.Select(a => new EvaluationAnswerResponseDto
            {
                Id = a.Id,
                Text = a.Text,
                Score = a.Score
            }).ToList();

            return Ok(ApiResponse<List<EvaluationAnswerResponseDto>>.SuccessResponse(response));
        }

        /// <summary>
        /// Get answer by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var answer = await _service.GetByIdAsync(id);
            if (answer == null)
                return NotFound(ApiResponse<EvaluationAnswerResponseDto>.FailResponse("Answer not found"));

            var response = new EvaluationAnswerResponseDto
            {
                Id = answer.Id,
                Text = answer.Text,
                Score = answer.Score
            };

            return Ok(ApiResponse<EvaluationAnswerResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Create a new evaluation answer
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateEvaluationAnswerRequest request)
        {
            var answer = new EvaluationAnswer
            {
                EvaluationQuestionId = request.EvaluationQuestionId,
                Text = request.Text,
                Score = request.Score
            };

            await _service.CreateAsync(answer);

            var response = new EvaluationAnswerResponseDto
            {
                Id = answer.Id,
                Text = answer.Text,
                Score = answer.Score
            };

            return Ok(ApiResponse<EvaluationAnswerResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Update an evaluation answer
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEvaluationAnswerRequest request)
        {
            var answer = await _service.GetByIdAsync(id);
            if (answer == null)
                return NotFound(ApiResponse<EvaluationAnswerResponseDto>.FailResponse("Answer not found"));

            if (request.Text != null)
                answer.Text = request.Text;
            if (request.Score.HasValue)
                answer.Score = request.Score.Value;

            await _service.UpdateAsync(id, answer);

            var response = new EvaluationAnswerResponseDto
            {
                Id = answer.Id,
                Text = answer.Text,
                Score = answer.Score
            };

            return Ok(ApiResponse<EvaluationAnswerResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Delete an evaluation answer
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Answer not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
