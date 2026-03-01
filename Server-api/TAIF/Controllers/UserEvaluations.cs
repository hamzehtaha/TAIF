using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq.Expressions;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserEvaluationsController : TaifControllerBase
    {
        private readonly IUserEvaluationService _service;

        public UserEvaluationsController(IUserEvaluationService service)
        {
            _service = service;
        }

        // ===============================
        // GET ALL WITH FILTER
        // ===============================
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] UserEvaluationFilter filter)
        {
            var isNonStudent = User.Identity?.IsAuthenticated == true && !IsStudent;

            Expression<Func<UserEvaluation, bool>> predicate = e =>
                (!filter.UserId.HasValue || e.UserId == filter.UserId)
                && (!filter.OrganizationId.HasValue || e.OrganizationId == filter.OrganizationId)
                && (!filter.MinPercentage.HasValue || e.Result.TotalPercentage >= filter.MinPercentage)
                && (!filter.MaxPercentage.HasValue || e.Result.TotalPercentage <= filter.MaxPercentage)
                && (!filter.FromDate.HasValue || e.CreatedAt >= filter.FromDate)
                && (!filter.ToDate.HasValue || e.CreatedAt <= filter.ToDate)
                // Students only see their own evaluations
                && (isNonStudent || e.UserId == UserId);

            var result = await _service.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: e => e.CreatedAt,
                orderByDescending: true
            );

            return Ok(ApiResponse<PagedResult<UserEvaluation>>.SuccessResponse(result));
        }

        // ===============================
        // GET BY ID
        // ===============================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var evaluation = await _service.GetByIdAsync(id);

            if (evaluation == null)
                return NotFound(ApiResponse<string>.FailResponse("Evaluation not found"));

            var response = new UserEvaluationResponseDto
            {
                Id = evaluation.Id,
                UserId = evaluation.UserId,
                OrganizationId = evaluation.OrganizationId,
                TotalPercentage = evaluation.Result.TotalPercentage,
                CompletedAt = evaluation.CreatedAt
            };

            return Ok(ApiResponse<UserEvaluationResponseDto>
                .SuccessResponse(response));
        }

        // ===============================
        // GET BY USER
        // ===============================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            Expression<Func<UserEvaluation, bool>> predicate =
                e => e.UserId == userId;

            var result = await _service.GetPagedAsync(
                filter: new UserEvaluationFilter
                {
                    Page = 1,
                    PageSize = int.MaxValue
                },
                predicate: predicate,
                orderBy: e => e.CreatedAt,
                orderByDescending: true
            );

            var response = result.Items.Select(e => new UserEvaluationResponseDto
            {
                Id = e.Id,
                UserId = e.UserId,
                OrganizationId = e.OrganizationId,
                TotalPercentage = e.Result.TotalPercentage,
                CompletedAt = e.CreatedAt
            }).ToList();

            return Ok(ApiResponse<List<UserEvaluationResponseDto>>
                .SuccessResponse(response));
        }

        // ===============================
        // SUBMIT
        // ===============================

        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitEvaluation dto)
        {
            var result = await _service.SubmitAsync(UserId, OrganizationId!.Value, dto);

            var response = new SubmitEvaluationResponseDto
            {
                EvaluationId = result.Id,
                TotalPercentage = result.Result.TotalPercentage,
                CompletedAt = result.CreatedAt,
                Questions = result.Result.Questions.Select(q => new QuestionEvaluationResultDto
                {
                    QuestionId = q.QuestionId,
                    SelectedAnswerId = q.SelectedAnswerId,
                    Percentage = q.Percentage
                }).ToList()
            };

            return Ok(ApiResponse<SubmitEvaluationResponseDto>
                .SuccessResponse(response));
        }
    }
}
