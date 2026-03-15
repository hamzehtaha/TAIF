using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.Interfaces.Services;

namespace TAIF.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlanController : TaifControllerBase
    {
        private readonly IUserPlanService _planService;

        public PlanController(IUserPlanService planService)
        {
            _planService = planService;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var plan = await _planService.GeneratePlanAsync(UserId);
            return Ok(plan);
        }
    }
}
