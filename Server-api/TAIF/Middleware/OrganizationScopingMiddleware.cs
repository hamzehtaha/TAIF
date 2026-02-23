using System.Net;
using System.Text.Json;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.API.Middleware
{
    public class OrganizationScopingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<OrganizationScopingMiddleware> _logger;

        private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
        {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/register/instructor",
            "/api/auth/refresh",
            "/swagger",
            "/health"
        };

        public OrganizationScopingMiddleware(RequestDelegate next, ILogger<OrganizationScopingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IOrganizationContext orgContext)
        {
            var path = context.Request.Path.Value ?? "";
            
            if (ExcludedPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            if (context.User.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            if (orgContext.IsSystemAdmin)
            {
                _logger.LogDebug("SystemAdmin access - bypassing org scoping for path: {Path}", path);
                await _next(context);
                return;
            }

            if (orgContext.OrganizationId == null)
            {
                _logger.LogWarning(
                    "Non-SystemAdmin user {UserId} has no OrganizationId - blocking access",
                    orgContext.UserId);

                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                context.Response.ContentType = "application/json";

                var response = new ApiResponse<object>
                {
                    ErrorCode = 403,
                    Message = "User must belong to an organization"
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                return;
            }

            await _next(context);
        }
    }
}
