using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
        [EnableRateLimiting("AuthRateLimit")]
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
        [EnableRateLimiting("AuthRateLimit")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (result == null)
                return Unauthorized(ApiResponse<string>.FailResponse("Invalid credentials"));

            return Ok(ApiResponse<AuthResponse>.SuccessResponse(result));
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            if (result == null)
                return Unauthorized(ApiResponse<string>.FailResponse("Invalid or expired refresh token"));

            return Ok(ApiResponse<AuthResponse>.SuccessResponse(result));
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            await _authService.ForgotPasswordAsync(request.Email);
            // Always return success to prevent email enumeration
            return Ok(ApiResponse<string>.SuccessResponse("If the email exists, a password reset code has been sent."));
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request.Email, request.Otp, request.NewPassword);
            if (!result)
                return BadRequest(ApiResponse<string>.FailResponse("Invalid or expired reset code."));

            return Ok(ApiResponse<string>.SuccessResponse("Password has been reset successfully."));
        }

            }
        }
