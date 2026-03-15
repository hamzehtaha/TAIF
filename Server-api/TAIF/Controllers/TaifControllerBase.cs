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

        protected UserRoleType Role
        {
            get
            {
                // ClaimTypes.Role is now the standard claim emitted by TokenService
                var value = User.FindFirstValue(ClaimTypes.Role);

                if (string.IsNullOrEmpty(value))
                    throw new UnauthorizedAccessException("Role claim missing");

                if (Enum.TryParse<UserRoleType>(value, out var role))
                    return role;

                throw new UnauthorizedAccessException($"Invalid Role claim: {value}");
            }
        }

        protected Guid? OrganizationId
        {
            get
            {
                var value = User.FindFirstValue("OrganizationId");
                
                if (string.IsNullOrEmpty(value))
                    return null;

                if (Guid.TryParse(value, out var orgId))
                    return orgId;

                return null;
            }
        }

        protected bool IsSuperAdmin => Role == UserRoleType.SuperAdmin;
        protected bool IsAdmin => Role == UserRoleType.Admin;
        protected bool IsContentCreator => Role == UserRoleType.ContentCreator;
        protected bool IsStudent => Role == UserRoleType.Student;
        protected UserRoleType UserRoleType => Role;
    }
}
