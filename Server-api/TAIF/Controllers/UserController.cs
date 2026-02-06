using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
    }
}
