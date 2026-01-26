using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.Interfaces;
using TAIF.Application.DTOs;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        public AuthController(IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Password
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
                return Unauthorized();

            return Ok(result);
        }


    }
}
