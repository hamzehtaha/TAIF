using System.Security.Claims;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.API.Middleware
{
    public class OrganizationContextMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<OrganizationContextMiddleware> _logger;

        public OrganizationContextMiddleware(RequestDelegate next, ILogger<OrganizationContextMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IOrganizationContext orgContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var orgIdClaim = context.User.FindFirst("OrganizationId")?.Value;
                var roleClaim = context.User.FindFirst("Role")?.Value;

                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    Guid? organizationId = null;
                    if (!string.IsNullOrEmpty(orgIdClaim) && Guid.TryParse(orgIdClaim, out var parsedOrgId))
                    {
                        organizationId = parsedOrgId;
                    }

                    int role = (int)UserRoleType.Student;
                    if (!string.IsNullOrEmpty(roleClaim) && int.TryParse(roleClaim, out var parsedRole))
                    {
                        role = parsedRole;
                    }

                    orgContext.SetContext(userId, organizationId, role);
                    
                    _logger.LogDebug(
                        "Organization context set: UserId={UserId}, OrgId={OrgId}, Role={Role}",
                        userId, organizationId, role);
                }
            }

            await _next(context);
        }
    }
}
