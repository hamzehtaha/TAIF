using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterestTagMappingController : TaifControllerBase
    {
        private readonly IInterestTagMappingService _mappingService;

        public InterestTagMappingController(IInterestTagMappingService mappingService)
        {
            _mappingService = mappingService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var mappings = await _mappingService.GetAllAsync();
            return Ok(ApiResponse<List<InterestTagMapping>>.SuccessResponse(mappings));
        }

        [HttpGet("interest/{interestId}")]
        public async Task<IActionResult> GetByInterestId([FromRoute] Guid interestId)
        {
            var mappings = await _mappingService.GetByInterestIdAsync(interestId);
            return Ok(ApiResponse<List<InterestTagMapping>>.SuccessResponse(mappings));
        }

        [HttpGet("tag/{tagId}")]
        public async Task<IActionResult> GetByTagId([FromRoute] Guid tagId)
        {
            var mappings = await _mappingService.GetByTagIdAsync(tagId);
            return Ok(ApiResponse<List<InterestTagMapping>>.SuccessResponse(mappings));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var mapping = await _mappingService.GetByIdAsync(id);
            if (mapping == null)
                return NotFound(ApiResponse<object>.FailResponse("InterestTagMapping not found"));
            return Ok(ApiResponse<InterestTagMapping>.SuccessResponse(mapping));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateInterestTagMappingRequest request)
        {
            var mapping = new InterestTagMapping
            {
                InterestId = request.InterestId,
                TagId = request.TagId,
                Weight = Math.Clamp(request.Weight, 0.0, 1.0)
            };
            var created = await _mappingService.CreateAsync(mapping);
            return Ok(ApiResponse<InterestTagMapping>.SuccessResponse(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateMappingWeightRequest request)
        {
            var updated = await _mappingService.UpdateAsync(id, request);
            return Ok(ApiResponse<InterestTagMapping>.SuccessResponse(updated));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _mappingService.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<object>.FailResponse("InterestTagMapping not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
