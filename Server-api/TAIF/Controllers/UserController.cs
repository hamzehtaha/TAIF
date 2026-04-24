using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : TaifControllerBase
    {
        private readonly IUserService _userService;
        private readonly IInterestService _interestService;

        public UserController(IUserService service, IInterestService interestService)
        {
            _userService = service;
            _interestService = interestService;
        }

        [HttpPut("interests")]
        public async Task<IActionResult> UpdateIntrests([FromBody] UpdateIntrestsRequest request)
        {
            await _interestService.InterestsValidationGuard(request.Interests);

            var user = await _userService.UpdateAsync(this.UserId, request);
            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var user = await _userService.GetByIdWithOrganizationAsync(this.UserId);

            if (user == null)
                return NotFound(ApiResponse<UserResponse>.FailResponse("User not found"));

            var userResponse = user.Adapt<UserResponse>();
            return Ok(ApiResponse<UserResponse>.SuccessResponse(userResponse));
        }

        #region Admin User Management

        [HttpGet]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.FindNoTrackingAsync(u => u.Role != UserRoleType.Student);
            var response = users.Select(u => u.Adapt<UserResponse>()).ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("students")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetAllStudents()
        {
            var users = await _userService.FindNoTrackingAsync(u => u.Role == UserRoleType.Student);
            var response = users.Select(u => u.Adapt<UserResponse>()).ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse<UserResponse>.FailResponse("User not found"));

            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }

        /// <summary>
        /// Creates a new Admin user. Only SuperAdmin can do this.
        /// </summary>
        [HttpPost("admin")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateUserRequest request)
        {
            return await CreateUserWithRole(request, UserRoleType.Admin);
        }

        /// <summary>
        /// Creates a new ContentCreator user. Admin and SuperAdmin can do this.
        /// </summary>
        [HttpPost("content-creator")]
        [Authorize(Policy = "AdminOrAbove")]
        public async Task<IActionResult> CreateContentCreator([FromBody] CreateUserRequest request)
        {
            return await CreateUserWithRole(request, UserRoleType.ContentCreator);
        }

        private async Task<IActionResult> CreateUserWithRole(CreateUserRequest request, UserRoleType role)
        {
            // Email uniqueness is enforced per-org by the DB unique index on (Email, OrganizationId).
            // The tenant query filter already scopes GetAllAsync() to the current org, but we do an
            // explicit check here to return a friendly 400 before hitting the DB constraint.
            var existingInOrg = await _userService.FindNoTrackingAsync(
                u => u.Email.ToLower() == request.Email.ToLower());
            if (existingInOrg.Count > 0)
                return BadRequest(ApiResponse<UserResponse>.FailResponse("A user with this email already exists in your organization."));

            var user = request.Adapt<User>();
            user.Id = Guid.NewGuid();
            user.Role = role;
            user.PasswordHash = PasswordHelper.Hash(request.Password);
            user.IsActive = true;
            user.IsCompleted = true;
            user.Birthday = request.Birthday ?? DateOnly.FromDateTime(DateTime.Now);
            user.OrganizationId = this.OrganizationId;

            await _userService.CreateAsync(user);

            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }

        #endregion
    }
}
