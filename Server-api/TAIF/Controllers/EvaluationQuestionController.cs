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
    public class EvaluationQuestionController : TaifControllerBase
    {
        private readonly IEvaluationQuestionService _service;
        private readonly IUserEvaluationService _userEvaluationService;
        public EvaluationQuestionController(IEvaluationQuestionService service, IUserEvaluationService userEvaluationService)
        {
            _service = service;
            _userEvaluationService = userEvaluationService;
        }

        /// <summary>
        /// Get all evaluation questions with answers
        /// </summary>
        [HttpGet]
        [AllowAnonymous] // Because new users need this before login
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllWithAnswersAsync();
            return Ok(ApiResponse<List<EvaluationQuestionResponseDto>>.SuccessResponse(result));
        }
        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitEvaluation dto)
        {
            var result = await _userEvaluationService.SubmitAsync(UserId, dto);
            var response = new SubmitEvaluationResponseDto
            {
                EvaluationId = result.Id,
                TotalScore = result.TotalScore,
                CompletedAt = result.CompletedAt
            };

            return Ok(ApiResponse<SubmitEvaluationResponseDto>
                .SuccessResponse(response));
        }
    }
}
