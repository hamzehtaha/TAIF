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
        private readonly IInstructorProfileService _instructorProfileService;
        public OrganizationController(IOrganizationService organizationService, IInstructorProfileService instructorProfileService)
        {
            _organizationService = organizationService;
            _instructorProfileService = instructorProfileService;
        }
        [HttpGet("")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var organizations = await _organizationService.GetAllAsync();
            if (organizations is null || organizations.Count == 0)
                return NotFound();
            return Ok(ApiResponse<List<Organization>>.SuccessResponse(organizations));
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

            return Ok(ApiResponse<PagedResult<Organization>>.SuccessResponse(result));
        }
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var organization = await _organizationService.GetByIdAsync(id);
            if (organization is null)
                return NotFound();
            return Ok(ApiResponse<Organization>.SuccessResponse(organization));
        }
        [HttpGet("current-org")]
        public async Task<IActionResult> GetCurrentOrg()
        {
            var instructor = await _instructorProfileService.FindNoTrackingAsync(
                predicate: ip => ip.UserId == UserId
            );
            if (instructor is null || instructor.Count <= 0 || instructor[0] is null || instructor[0].OrganizationId is null)
            {
                return NotFound("Your current user is not instructor.");
            }
            var organization = await _organizationService.GetByIdAsync(instructor[0].OrganizationId.Value);
            if (organization is null)
                return NotFound();
            return Ok(ApiResponse<Organization>.SuccessResponse(organization));
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
            return Ok(ApiResponse<Organization>.SuccessResponse(created_organization));
        }
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateOrganizationRequest request)
        {
            var organization = await _organizationService.UpdateAsync(id, request);
            return Ok(ApiResponse<Organization>.SuccessResponse(organization));
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