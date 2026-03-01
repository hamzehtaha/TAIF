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
    public class SkillController : TaifControllerBase
    {
        private readonly ISkillService _skillService;

        public SkillController(ISkillService skillService)
        {
            _skillService = skillService;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var skills = await _skillService.GetAllAsync();

            var response = skills.Select(s => new SkillResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                OrganizationId = s.OrganizationId
            }).ToList();

            return Ok(ApiResponse<List<SkillResponse>>.SuccessResponse(response));
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var skill = await _skillService.GetByIdAsync(id);

            if (skill == null)
                return NotFound(ApiResponse<SkillResponse>.FailResponse("Skill not found"));

            var response = new SkillResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Description = skill.Description,
                OrganizationId = skill.OrganizationId
            };

            return Ok(ApiResponse<SkillResponse>.SuccessResponse(response));
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateSkillRequest request)
        {
            var skill = new Skill
            {
                Name = request.Name,
                Description = request.Description,
                OrganizationId = this.OrganizationId
            };

            await _skillService.CreateAsync(skill);

            var response = new SkillResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Description = skill.Description,
                OrganizationId = skill.OrganizationId
            };

            return Ok(ApiResponse<SkillResponse>.SuccessResponse(response));
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSkillRequest request)
        {
            var skill = await _skillService.GetByIdAsync(id);

            if (skill == null)
                return NotFound(ApiResponse<SkillResponse>.FailResponse("Skill not found"));

            if (request.Name != null)
                skill.Name = request.Name;

            if (request.Description != null)
                skill.Description = request.Description;

            await _skillService.UpdateAsync(id, skill);

            var response = new SkillResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Description = skill.Description,
                OrganizationId = skill.OrganizationId
            };

            return Ok(ApiResponse<SkillResponse>.SuccessResponse(response));
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _skillService.DeleteAsync(id);

            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Skill not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
