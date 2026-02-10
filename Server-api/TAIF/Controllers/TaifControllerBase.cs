using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAIF.Domain.Entities;

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
        protected UserRoleType UserRoleType
        {
            get
            {
                var value = User.FindFirstValue("UserRoleType");

                if (string.IsNullOrEmpty(value))
                    throw new UnauthorizedAccessException("UserRoleType claim missing");

                if (!Enum.TryParse<UserRoleType>(value, out var userRoleType))
                    throw new UnauthorizedAccessException($"Invalid UserRoleType claim: {value}");

                return userRoleType;
            }
        }
    }
}
