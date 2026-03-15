using Microsoft.AspNetCore.Authorization;
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
                QuestionIds = (List<Guid>)e.QuestionIds
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
                QuestionIds = (List<Guid>)evaluation.QuestionIds
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
            var evaluation = new Evaluation
            {
                Name = request.Name,
                Description = request.Description,
                QuestionIds = request.QuestionIds ?? new List<Guid>(),
                OrganizationId = this.OrganizationId
            };

            await _evaluationService.CreateAsync(evaluation);

            var response = new EvaluationResponse
            {
                Id = evaluation.Id,
                Name = evaluation.Name,
                Description = evaluation.Description,
                QuestionIds = (List<Guid>)evaluation.QuestionIds,
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

            if (request.QuestionIds != null)
                evaluation.QuestionIds = request.QuestionIds;

            await _evaluationService.UpdateAsync(id, evaluation);

            var response = new EvaluationResponse
            {
                Id = evaluation.Id,
                Name = evaluation.Name,
                Description = evaluation.Description,
                QuestionIds = (List<Guid>)evaluation.QuestionIds
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