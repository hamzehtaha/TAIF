using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TAIF.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class TaifControllerBase : ControllerBase
    {
        protected Guid UserId
        {
            get
            {
                var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdValue))
                    throw new UnauthorizedAccessException("UserId claim missing");

                if (!Guid.TryParse(userIdValue, out var userId))
                    throw new UnauthorizedAccessException("Invalid UserId claim");

                return userId;
            }
        }
        protected bool IsInstructor
        {
            get
            {
                var value = User.FindFirstValue("IsInstructor");

                if (string.IsNullOrEmpty(value))
                    return false;

                return bool.TryParse(value, out var isInstructor) && isInstructor;
            }
        }
    }
}
