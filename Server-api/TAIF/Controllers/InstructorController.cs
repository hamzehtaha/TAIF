using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.API.Controllers;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

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
            var response = instructors.Select(i => new InstructorResponse
            {
                Id = i.Id,
                FirstName = i.FirstName,
                LastName = i.LastName,
                Bio = i.Bio,
                Expertises = i.Expertises,
                YearsOfExperience = i.YearsOfExperience,
                OrganizationId = i.OrganizationId
            }).ToList();
            return Ok(ApiResponse<List<InstructorResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var instructor = await _instructorService.GetByIdAsync(id);
            if (instructor == null)
                return NotFound(ApiResponse<InstructorResponse>.FailResponse("Instructor not found"));

            var response = new InstructorResponse
            {
                Id = instructor.Id,
                FirstName = instructor.FirstName,
                LastName = instructor.LastName,
                Bio = instructor.Bio,
                Expertises = instructor.Expertises,
                YearsOfExperience = instructor.YearsOfExperience
            };
            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(response));
        }

        [HttpPost]
        [Authorize(Policy = "ContentCreatorOrAbove")]
        public async Task<IActionResult> Create([FromBody] CreateInstructorRequest request)
        {
            var instructor = new Instructor
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Bio = request.Bio,
                Expertises = request.Expertises ?? new List<string>(),
                YearsOfExperience = request.YearsOfExperience,
                OrganizationId = this.OrganizationId
            };

            await _instructorService.CreateAsync(instructor);

            var response = new InstructorResponse
            {
                Id = instructor.Id,
                FirstName = instructor.FirstName,
                LastName = instructor.LastName,
                Bio = instructor.Bio,
                Expertises = instructor.Expertises,
                YearsOfExperience = instructor.YearsOfExperience
            };
            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(response));
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

            var response = new InstructorResponse
            {
                Id = instructor.Id,
                FirstName = instructor.FirstName,
                LastName = instructor.LastName,
                Bio = instructor.Bio,
                Expertises = instructor.Expertises,
                YearsOfExperience = instructor.YearsOfExperience
            };
            return Ok(ApiResponse<InstructorResponse>.SuccessResponse(response));
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

    public class InstructorResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Bio { get; set; }
        public List<string> Expertises { get; set; } = new();
        public int YearsOfExperience { get; set; }
        public Guid? OrganizationId { get; set; }
    }

    public class CreateInstructorRequest
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Bio { get; set; }
        public List<string>? Expertises { get; set; }
        public int YearsOfExperience { get; set; }
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can set this
    }

    public class UpdateInstructorRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Bio { get; set; }
        public List<string>? Expertises { get; set; }
        public int? YearsOfExperience { get; set; }
    }
}
