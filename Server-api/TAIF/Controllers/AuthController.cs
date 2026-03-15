using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Services;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : TaifControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IUserService _userService;
        private readonly IVerificationService _verificationService;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger,
            IUserService userService,
            IVerificationService verificationService)
        {
            _authService = authService;
            _logger = logger;
            _userService = userService;
            _verificationService = verificationService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);

            // Auto-send verification email after successful registration.
            // Failure is logged but does NOT block the registration response.
            try
            {
                await _verificationService.SendAsync(result.UserId, "Email");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send verification email for user {UserId}", result.UserId);
            }

            return Ok(ApiResponse<AuthResponse>.SuccessResponse(result));
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdValue))
                return Unauthorized("UserId claim not found");

            if (!Guid.TryParse(userIdValue, out var userId))
                return Unauthorized("Invalid UserId format");

            var user = await _userService.GetByIdWithOrganizationAsync(userId);
            if (user == null)
                return NotFound("User not found");

            return Ok(ApiResponse<UserResponse>.SuccessResponse(user.Adapt<UserResponse>()));
        }
    }
}
