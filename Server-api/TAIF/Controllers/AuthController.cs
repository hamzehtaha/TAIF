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
        private readonly IInstructorProfileService _instructorProfileService;
        public AuthController(IAuthService authService,ILogger<AuthController> logger,IUserService userService, IInstructorProfileService instructorProfileService)
        {
            _authService = authService;
            _logger = logger;
            _userService = userService;
            _instructorProfileService = instructorProfileService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(
                request
            );

            return Ok(result);
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
            // 2️ Load user
            var user = await _userService.GetByIdAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }
            UserResponse userResponse = new UserResponse();
            userResponse.Id = user.Id;
            userResponse.Email = user.Email;
            userResponse.FirstName = user.FirstName;
            userResponse.LastName = user.LastName;
            userResponse.Birthday = user.Birthday;
            userResponse.IsActive = user.IsActive;
            userResponse.IsInstructor = user.IsInstructor;
            userResponse.CreatedAt = user.CreatedAt;
            userResponse.UpdatedAt = user.UpdatedAt;
            if (user.IsInstructor)
            {
                var instructor = await _instructorProfileService.GetByUserIdAsync(userId);
                if (instructor is not null)
                {
                    userResponse.InstructorProfile = new InstructorProfileResponse();
                    userResponse.InstructorProfile.Id = instructor.Id;
                    userResponse.InstructorProfile.Bio = instructor.Bio;
                    userResponse.InstructorProfile.CoursesCount = instructor.CoursesCount;
                    userResponse.InstructorProfile.LinkedInUrl = instructor.LinkedInUrl;
                    userResponse.InstructorProfile.WebsiteUrl = instructor.WebsiteUrl;
                    userResponse.InstructorProfile.YearsOfExperience = instructor.YearsOfExperience;
                }
            }
            // 3️ Return user (DTO recommended)
            return Ok(ApiResponse<UserResponse>.SuccessResponse(userResponse));
        }
    }
}
