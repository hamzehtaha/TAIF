using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrganizationController : TaifControllerBase
    {
        private readonly IOrganizationService _organizationService;
        public OrganizationController(IOrganizationService organizationService)
        {
            _organizationService = organizationService;
        }
        [HttpGet("")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var organizations = await _organizationService.GetAllAsync();
            if (organizations is null || organizations.Count == 0)
                return NotFound();
            return Ok(ApiResponse<List<OrganizationResponse>>.SuccessResponse(
                organizations.Select(o => o.Adapt<OrganizationResponse>()).ToList()));
        }
        [HttpGet("paged")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPaged([FromQuery] BaseFilter filter)
        {
            Expression<Func<Organization, bool>> predicate = o => true;

            var result = await _organizationService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: o => o.CreatedAt,
                orderByDescending: true
            );

            var response = new PagedResult<OrganizationResponse>
            {
                Items = result.Items.Select(o => o.Adapt<OrganizationResponse>()).ToList(),
                Page = result.Page,
                PageSize = result.PageSize,
                TotalCount = result.TotalCount
            };

            return Ok(ApiResponse<PagedResult<OrganizationResponse>>.SuccessResponse(response));
        }
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var organization = await _organizationService.GetByIdAsync(id);
            if (organization is null)
                return NotFound();
            return Ok(ApiResponse<OrganizationResponse>.SuccessResponse(organization.Adapt<OrganizationResponse>()));
        }

        [HttpPost("")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateOrganizationRequest request)
        {
            var organization = new Organization
            {
                Name = request.Name,
                Logo = request.Logo,
                Description = request.Description,
                Email = request.Email,
                Phone = request.Phone,
                IsActive = true
            };

            var created_organization = await _organizationService.CreateAsync(organization);
            return Ok(ApiResponse<OrganizationResponse>.SuccessResponse(created_organization.Adapt<OrganizationResponse>()));
        }
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateOrganizationRequest request)
        {
            var organization = await _organizationService.UpdateAsync(id, request);
            return Ok(ApiResponse<OrganizationResponse>.SuccessResponse(organization.Adapt<OrganizationResponse>()));
        }
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _organizationService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}