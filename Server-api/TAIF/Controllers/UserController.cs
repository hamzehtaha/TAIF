using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            var response = users
                .Where(u => u.Role != UserRoleType.Student)
                .Select(u => u.Adapt<UserResponse>())
                .ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("students")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllStudents()
        {
            var users = await _userService.GetAllAsync();
            var response = users
                .Where(u => u.Role == UserRoleType.Student)
                .Select(u => u.Adapt<UserResponse>())
                .ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse<UserResponse>.FailResponse("User not found"));

            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var existingUsers = await _userService.GetAllAsync();
            if (existingUsers.Any(u => u.Email.ToLower() == request.Email.ToLower()))
                return BadRequest(ApiResponse<UserResponse>.FailResponse("Email already exists"));

            var user = request.Adapt<User>();
            user.Id = Guid.NewGuid();
            user.PasswordHash = HashPassword(request.Password);
            user.IsActive = true;
            user.Birthday = request.Birthday ?? DateOnly.FromDateTime(DateTime.Now);
            user.OrganizationId = this.OrganizationId;
            user.IsCompleted = request.Role == UserRoleType.SuperAdmin || request.Role == UserRoleType.Student;

            await _userService.CreateAsync(user);

            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }

        private static string HashPassword(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        #endregion
    }
    }
