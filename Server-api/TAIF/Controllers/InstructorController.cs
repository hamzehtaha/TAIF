using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InstructorController : TaifControllerBase
    {
        private readonly IInstructorService _instructorService;

        public InstructorController(IInstructorService instructorService)
        {
            _instructorService = instructorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var instructors = await _instructorService.GetAllAsync();
            return Ok(ApiResponse<List<InstructorResponse>>.SuccessResponse(
                instructors.Select(i => i.Adapt<InstructorResponse>()).ToList()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var instructor = await _instructorService.GetByIdAsync(id);
            if (instructor == null)
                return NotFound(ApiResponse<InstructorResponse>.FailResponse("Instructor not found"));

            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(instructor.Adapt<InstructorResponse>()));
        }

        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateInstructorRequest request)
        {
            var instructor = request.Adapt<TAIF.Domain.Entities.Instructor>();
            instructor.Expertises = request.Expertises ?? new List<string>();
            instructor.OrganizationId = this.OrganizationId;

            await _instructorService.CreateAsync(instructor);

            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(instructor.Adapt<InstructorResponse>()));
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInstructorRequest request)
        {
            var instructor = await _instructorService.GetByIdAsync(id);
            if (instructor == null)
                return NotFound(ApiResponse<InstructorResponse>.FailResponse("Instructor not found"));

            if (request.FirstName != null) instructor.FirstName = request.FirstName;
            if (request.LastName != null) instructor.LastName = request.LastName;
            if (request.Bio != null) instructor.Bio = request.Bio;
            if (request.Expertises != null) instructor.Expertises = request.Expertises;
            if (request.YearsOfExperience.HasValue) instructor.YearsOfExperience = request.YearsOfExperience.Value;

            await _instructorService.UpdateAsync(id, instructor);

            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(instructor.Adapt<InstructorResponse>()));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _instructorService.DeleteAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.FailResponse("Instructor not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(true));
        }
    }
}
