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
                var value = User.FindFirstValue("Role");

                if (string.IsNullOrEmpty(value))
                    throw new UnauthorizedAccessException("Role claim missing");

                if (int.TryParse(value, out var roleInt))
                    return (UserRoleType)roleInt;

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

        protected bool IsSystemAdmin => Role == UserRoleType.SystemAdmin;
        protected bool IsOrgAdmin => Role == UserRoleType.OrgAdmin;
        protected bool IsInstructor => Role == UserRoleType.Instructor;
        protected bool IsStudent => Role == UserRoleType.Student;

        protected UserRoleType UserRoleType => Role;
    }
}
