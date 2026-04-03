using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using TAIF.Domain.Models;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationController : TaifControllerBase
    {
        private readonly IEvaluationService _evaluationService;

        public EvaluationController(IEvaluationService evaluationService)
        {
            _evaluationService = evaluationService;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var evaluations = await _evaluationService.GetAllAsync();

            var response = evaluations.Select(e => new EvaluationResponse
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                InterestId = e.InterestId,
                QuestionMappings = e.QuestionMappings.Select(qm => new QuestionMappingResponseDto
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order
                }).ToList()
            }).ToList();

            return Ok(ApiResponse<List<EvaluationResponse>>.SuccessResponse(response));
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var evaluation = await _evaluationService.GetByIdAsync(id);

            if (evaluation == null)
                return NotFound(ApiResponse<EvaluationResponse>.FailResponse("Evaluation not found"));

            var response = new EvaluationResponse
            {
                Id = evaluation.Id,
                Name = evaluation.Name,
                Description = evaluation.Description,
                InterestId = evaluation.InterestId,
                QuestionMappings = evaluation.QuestionMappings.Select(qm => new QuestionMappingResponseDto
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationResponse>.SuccessResponse(response));
        }

        // =========================
        // GET BY INTEREST
        // =========================
        [HttpGet("interest/{interestId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByInterest(Guid interestId)
        {
            var evaluations = await _evaluationService.FindNoTrackingAsync(e => e.InterestId == interestId);
            var evaluation = evaluations.FirstOrDefault();

            if (evaluation == null)
                return NotFound(ApiResponse<EvaluationResponse>.FailResponse("No evaluation found for this interest"));

            var response = new EvaluationResponse
            {
                Id = evaluation.Id,
                Name = evaluation.Name,
                Description = evaluation.Description,
                InterestId = evaluation.InterestId,
                QuestionMappings = evaluation.QuestionMappings.Select(qm => new QuestionMappingResponseDto
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationResponse>.SuccessResponse(response));
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateEvaluationRequest request)
        {
            var evaluationId = Guid.NewGuid();
            var orgId = this.OrganizationId;
            
            var evaluation = new Evaluation
            {
                Id = evaluationId,
                Name = request.Name,
                Description = request.Description,
                InterestId = request.InterestId,
                QuestionMappings = request.QuestionMappings?.Select(qm => new EvaluationQuestionMapping
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order,
                    EvaluationId = evaluationId,
                    OrganizationId = orgId
                }).ToList() ?? new List<EvaluationQuestionMapping>(),
                OrganizationId = orgId
            };

            await _evaluationService.CreateAsync(evaluation);

            var response = new EvaluationResponse
            {
                Id = evaluation.Id,
                Name = evaluation.Name,
                Description = evaluation.Description,
                InterestId = evaluation.InterestId,
                QuestionMappings = evaluation.QuestionMappings.Select(qm => new QuestionMappingResponseDto
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationResponse>.SuccessResponse(response));
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEvaluationRequest request)
        {
            var evaluation = await _evaluationService.GetByIdAsync(id);

            if (evaluation == null)
                return NotFound(ApiResponse<EvaluationResponse>.FailResponse("Evaluation not found"));

            if (request.Name != null)
                evaluation.Name = request.Name;

            if (request.Description != null)
                evaluation.Description = request.Description;

            if (request.InterestId.HasValue)
                evaluation.InterestId = request.InterestId;

            if (request.QuestionMappings != null)
                evaluation.QuestionMappings = request.QuestionMappings.Select(qm => new EvaluationQuestionMapping
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order,
                    EvaluationId = id,
                    OrganizationId = evaluation.OrganizationId
                }).ToList();

            var updatedEvaluation = await _evaluationService.UpdateWithMappingsAsync(id, evaluation);

            var response = new EvaluationResponse
            {
                Id = updatedEvaluation.Id,
                Name = updatedEvaluation.Name,
                Description = updatedEvaluation.Description,
                InterestId = updatedEvaluation.InterestId,
                QuestionMappings = updatedEvaluation.QuestionMappings.Select(qm => new QuestionMappingResponseDto
                {
                    QuestionId = qm.QuestionId,
                    Order = qm.Order
                }).ToList()
            };

            return Ok(ApiResponse<EvaluationResponse>.SuccessResponse(response));
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _evaluationService.DeleteAsync(id);

            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Evaluation not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}