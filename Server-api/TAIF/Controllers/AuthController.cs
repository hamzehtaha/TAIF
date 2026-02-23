using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : TaifControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IUserService _userService;
        public AuthController(IAuthService authService,ILogger<AuthController> logger,IUserService userService)
        {
            _authService = authService;
            _logger = logger;
            _userService = userService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<AuthResponse>.SuccessResponse(result));
        }

        [HttpPost("register/instructor")]
        public async Task<IActionResult> RegisterInstructor(RegisterInstructorRequest request)
        {
            var result = await _authService.RegisterInstructorAsync(request);
            return Ok(ApiResponse<AuthResponse>.SuccessResponse(result));
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);

            if (result == null)
            {
                return Unauthorized();
            }
            return Ok(result);
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            // 1️ Read GUID from claims
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdValue))
            {
                return Unauthorized("UserId claim not found");
            }
            if (!Guid.TryParse(userIdValue, out var userId))
            {
                return Unauthorized("Invalid UserId format");
            }
            // 2️ Load user with organization
            var user = await _userService.GetByIdWithOrganizationAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }
            UserResponse userResponse = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Birthday = user.Birthday,
                IsActive = user.IsActive,
                Role = user.Role,
                UserRoleType = user.Role,
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsCompleted = user.IsCompleted
            };
            return Ok(ApiResponse<UserResponse>.SuccessResponse(userResponse));
        }
    }
}
