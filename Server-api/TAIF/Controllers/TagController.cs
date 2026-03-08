using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TagController : TaifControllerBase
    {
        private readonly ITagService _tagService;

        public TagController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var tags = await _tagService.GetAllAsync();
            return Ok(ApiResponse<List<TagResponse>>.SuccessResponse(
                tags.Select(t => t.Adapt<TagResponse>()).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var tag = await _tagService.GetByIdAsync(id);
            if (tag == null)
                return NotFound(ApiResponse<object>.FailResponse("Tag not found"));
            return Ok(ApiResponse<TagResponse>.SuccessResponse(tag.Adapt<TagResponse>()));
        }

        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateTagRequest request)
        {
            var tag = request.Adapt<Tag>();

            var created = await _tagService.CreateAsync(tag);
            return Ok(ApiResponse<TagResponse>.SuccessResponse(created.Adapt<TagResponse>()));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateTagRequest request)
        {
            var updated = await _tagService.UpdateAsync(id, request);
            return Ok(ApiResponse<TagResponse>.SuccessResponse(updated.Adapt<TagResponse>()));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _tagService.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<object>.FailResponse("Tag not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}
