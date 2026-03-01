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
    public class AnswerController : TaifControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswerController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var answers = await _answerService.GetAllAsync();

            var response = answers.Select(a => new AnswerResponse
            {
                Id = a.Id,
                Text = a.Text,
                OrganizationId = a.OrganizationId
            }).ToList();

            return Ok(ApiResponse<List<AnswerResponse>>.SuccessResponse(response));
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var answer = await _answerService.GetByIdAsync(id);

            if (answer == null)
                return NotFound(ApiResponse<AnswerResponse>.FailResponse("Answer not found"));

            var response = new AnswerResponse
            {
                Id = answer.Id,
                Text = answer.Text,
                OrganizationId = answer.OrganizationId
            };

            return Ok(ApiResponse<AnswerResponse>.SuccessResponse(response));
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateAnswerRequest request)
        {
            var answer = new Answer
            {
                Text = request.Text,
                OrganizationId = this.OrganizationId
            };

            await _answerService.CreateAsync(answer);

            var response = new AnswerResponse
            {
                Id = answer.Id,
                Text = answer.Text,
                OrganizationId = answer.OrganizationId
            };

            return Ok(ApiResponse<AnswerResponse>.SuccessResponse(response));
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnswerRequest request)
        {
            var answer = await _answerService.GetByIdAsync(id);

            if (answer == null)
                return NotFound(ApiResponse<AnswerResponse>.FailResponse("Answer not found"));

            if (request.Text != null)
                answer.Text = request.Text;

            await _answerService.UpdateAsync(id, answer);

            var response = new AnswerResponse
            {
                Id = answer.Id,
                Text = answer.Text,
                OrganizationId = answer.OrganizationId
            };

            return Ok(ApiResponse<AnswerResponse>.SuccessResponse(response));
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _answerService.DeleteAsync(id);

            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Answer not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
