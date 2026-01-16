using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TAIF.Domain.Entities;

namespace TAIF.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : ControllerBase
    {
        [HttpGet]
        public IActionResult Me()
        {
            return Ok(new
            {
                Message = "You are authorized",
            });
        }
    }

}
