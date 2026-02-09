using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InstructorProfileController : TaifControllerBase
    {
        private readonly IInstructorProfileService _instructorProfileService;
        public InstructorProfileController(IInstructorProfileService instructorProfileService)
        {
            _instructorProfileService = instructorProfileService;
        }
        [HttpGet("get-current-instructor")]
        public async Task<IActionResult> GetInstructorProfileByUserId()
        {
            if (!IsInstructor)
            {
                return BadRequest();
            }
            var instructor = await _instructorProfileService.GetByUserIdAsync(UserId);
            if (instructor is null)
            {
                return NotFound();
            }
            InstructorProfileResponse instructorResponse = new InstructorProfileResponse();
            instructorResponse.Id = instructor.Id;
            instructorResponse.Bio = instructor.Bio;
            instructorResponse.CoursesCount = instructor.CoursesCount;
            instructorResponse.LinkedInUrl = instructor.LinkedInUrl;
            instructorResponse.WebsiteUrl = instructor.WebsiteUrl;
            instructorResponse.YearsOfExperience = instructor.YearsOfExperience;
            return Ok(ApiResponse<InstructorProfile>.SuccessResponse(instructor));
        }
        [HttpGet]
        public async Task<IActionResult> GetAllInstructors()
        {
            if (!IsInstructor)
            {
                return BadRequest();
            }
            var instructors = await _instructorProfileService.GetAllAsync();
            if (instructors is null)
            {
                return NotFound();
            }
            return Ok(ApiResponse<List<InstructorProfile>>.SuccessResponse(instructors));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update ([FromRoute] Guid id, [FromBody] UpdateInstructorProfileRequest request)
        {
            var instructorProfile = await _instructorProfileService.UpdateAsync(id, request);
            return Ok(ApiResponse<InstructorProfile>.SuccessResponse(instructorProfile));
        }
    }
}
