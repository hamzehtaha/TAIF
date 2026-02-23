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
    public class InstructorProfileController : TaifControllerBase
    {
        private readonly IInstructorProfileService _instructorProfileService;
        public InstructorProfileController(IInstructorProfileService instructorProfileService)
        {
            _instructorProfileService = instructorProfileService;
        }
        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var instructors = await _instructorProfileService.GetAllAsync();
            if (instructors is null || instructors.Count == 0)
                return NotFound();
            return Ok(ApiResponse<List<InstructorProfile>>.SuccessResponse(instructors));
        }
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] BaseFilter filter)
        {
            Expression<Func<InstructorProfile, bool>> predicate = ip => true;

            var result = await _instructorProfileService.GetPagedAsync(
                filter: filter,
                predicate: predicate,
                orderBy: ip => ip.CreatedAt,
                orderByDescending: true
            );

            return Ok(ApiResponse<PagedResult<InstructorProfile>>.SuccessResponse(result));
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var instructor = await _instructorProfileService.GetByIdAsync(id);
            if (instructor is null)
                return NotFound();
            return Ok(ApiResponse<InstructorProfile>.SuccessResponse(instructor));
        }
        [HttpGet("current-profile")]
        public async Task<IActionResult> GetCurrentProfile()
        {
            var profile = await _instructorProfileService.GetProfileByUserIdAsync(UserId);

            if (profile is null)
                return NotFound();

            return Ok(ApiResponse<InstructorProfileResponse>.SuccessResponse(profile));
        }

        [HttpPut("current-profile")]
        public async Task<IActionResult> UpdateCurrentProfile([FromBody] UpdateInstructorProfileRequest request)
        {
            var profile = await _instructorProfileService.UpdateProfileAsync(UserId, request);

            if (profile is null)
                return NotFound("Instructor profile not found");

            return Ok(ApiResponse<InstructorProfileResponse>.SuccessResponse(profile));
        }
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId([FromRoute] Guid userId)
        {
            var instructors = await _instructorProfileService.FindNoTrackingAsync(
                predicate: ip => ip.UserId == userId
            );
            
            if (instructors is null || instructors.Count == 0)
                return NotFound();
            
            return Ok(ApiResponse<List<InstructorProfile>>.SuccessResponse(instructors));
        }
        [HttpPost("")]
        public async Task<IActionResult> Create([FromBody] CreateInstructorProfileRequest request)
        {
            var instructor = new InstructorProfile
            {
                UserId = UserId,
                YearsOfExperience = request.YearsOfExperience,
                Rating = 0m,
                CoursesCount = 0
            };

            var created_instructor = await _instructorProfileService.CreateWithAutoOrgAsync(instructor);
            return Ok(ApiResponse<InstructorProfile>.SuccessResponse(created_instructor));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateInstructorProfileRequest request)
        {
            var instructor = await _instructorProfileService.GetByIdAsync(id);
            if (instructor is null)
                return NotFound();

            var instructor_updated = await _instructorProfileService.UpdateAsync(id, request);
            return Ok(ApiResponse<InstructorProfile>.SuccessResponse(instructor_updated));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var instructor = await _instructorProfileService.GetByIdAsync(id);
            if (instructor is null)
                return NotFound();

            // Instructor can only delete their own profile
            // Admin can delete anyone's profile
            if (UserRoleType != UserRoleType.SuperAdmin && instructor.UserId != this.UserId)
                return Forbid();

            var result = await _instructorProfileService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return Ok(ApiResponse<bool>.SuccessResponse(result));
        }
    }
}