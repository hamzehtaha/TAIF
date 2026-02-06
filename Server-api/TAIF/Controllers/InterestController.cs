using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterestController : TaifControllerBase
    {
        private readonly IInterestService _interestService;

        public InterestController(IInterestService interestService)
        {
            _interestService = interestService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var interests = await _interestService.GetAllAsync();
            return Ok(ApiResponse<List<Interest>>.SuccessResponse(interests));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var interest = await _interestService.GetByIdAsync(id);
            if (interest == null)
                return NotFound(ApiResponse<object>.FailResponse("Interest not found"));
            return Ok(ApiResponse<Interest>.SuccessResponse(interest));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateInterestRequest request)
        {
            var interest = new Interest
            {
                Name = request.Name
            };
            var created = await _interestService.CreateAsync(interest);
            return Ok(ApiResponse<Interest>.SuccessResponse(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateInterestRequest request)
        {
            var updated = await _interestService.UpdateAsync(id, request);
            return Ok(ApiResponse<Interest>.SuccessResponse(updated));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _interestService.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<object>.FailResponse("Interest not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
