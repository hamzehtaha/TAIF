using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            return Ok(ApiResponse<User>.SuccessResponse(user));
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var user = await _userService.GetByIdWithOrganizationAsync(this.UserId);

            if (user == null)
            {
                return NotFound(ApiResponse<UserResponse>.FailResponse("User not found"));
            }

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Birthday = user.Birthday,
                IsActive = user.IsActive,
                Role = user.Role,
                RoleName = user.Role.ToString(),
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsCompleted = user.IsCompleted,
                EmailVerified = user.EmailVerified
            };
            return Ok(ApiResponse<UserResponse>.SuccessResponse(userResponse));
        }

        #region Admin User Management

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            // Return all users except students (students have their own endpoint)
            var nonStudentUsers = users.Where(u => u.Role != UserRoleType.Student);
            var response = nonStudentUsers.Select(u => new UserResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                RoleName = u.Role.ToString(),
                IsActive = u.IsActive,
                EmailVerified = u.EmailVerified,
                OrganizationId = u.OrganizationId,
                CreatedAt = u.CreatedAt
            }).ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("students")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllStudents()
        {
            var users = await _userService.GetAllAsync();
            var students = users.Where(u => u.Role == UserRoleType.Student);
            var response = students.Select(u => new UserResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                RoleName = u.Role.ToString(),
                IsActive = u.IsActive,
                EmailVerified = u.EmailVerified,
                OrganizationId = u.OrganizationId,
                CreatedAt = u.CreatedAt
            }).ToList();
            return Ok(ApiResponse<List<UserResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse<UserResponse>.FailResponse("User not found"));

            var response = new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                RoleName = user.Role.ToString(),
                IsActive = user.IsActive,
                EmailVerified = user.EmailVerified,
                OrganizationId = user.OrganizationId,
                CreatedAt = user.CreatedAt
            };
            return Ok(ApiResponse<UserResponse>.SuccessResponse(response));
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            // Check if email already exists
            var existingUsers = await _userService.GetAllAsync();
            if (existingUsers.Any(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(ApiResponse<UserResponse>.FailResponse("Email already exists"));
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                Role = request.Role,
                IsActive = true,
                Birthday = request.Birthday ?? DateOnly.FromDateTime(DateTime.Now),
                OrganizationId = this.OrganizationId,
                IsCompleted = request.Role == UserRoleType.SuperAdmin || request.Role == UserRoleType.Student
            };

            await _userService.CreateAsync(user);

            var response = new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                RoleName = user.Role.ToString(),
                IsActive = user.IsActive,
                OrganizationId = user.OrganizationId,
                CreatedAt = user.CreatedAt
            };
            return Ok(ApiResponse<UserResponse>.SuccessResponse(response));
        }

        private static string HashPassword(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        #endregion
    }

    public class CreateUserRequest
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public UserRoleType Role { get; set; }
        public DateOnly? Birthday { get; set; }
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateOnly Birthday { get; set; }
        public UserRoleType Role { get; set; }
        public string RoleName { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public bool EmailVerified { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}
