using Mapster;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IInstructorRepository _instructorProfileRepository;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly AuthOptions _authOptions;
        private readonly IVerificationService _verificationService;

        public AuthService(
            IUserRepository userRepository,
            IOrganizationRepository organizationRepository,
            IInstructorRepository instructorProfileRepository,
            ITokenService tokenService,
            IConfiguration configuration,
            IOptions<AuthOptions> authOptions,
            IVerificationService verificationService)
        {
            _userRepository = userRepository;
            _organizationRepository = organizationRepository;
            _instructorProfileRepository = instructorProfileRepository;
            _tokenService = tokenService;
            _configuration = configuration;
            _authOptions = authOptions.Value;
            _verificationService = verificationService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Resolve the target organization: use slug if provided, otherwise fallback to public org
            Organization? org = null;
            if (!string.IsNullOrWhiteSpace(request.OrgSlug))
            {
                org = await _organizationRepository.GetBySlugAsync(request.OrgSlug);
                if (org == null || !org.IsActive)
                    throw new InvalidOperationException("Organization not found or is inactive.");
            }
            else
            {
                org = await _organizationRepository.GetPublicOrganizationAsync();
                if (org == null)
                    throw new InvalidOperationException("Public organization not found. Please run seeders first.");
            }

            // Email must be unique within the target org only
            var existing = await _userRepository.GetByEmailInOrgAsync(request.Email, org.Id);
            if (existing is not null)
                throw new InvalidOperationException("Unable to complete registration. Please try again or use a different email.");

            var user = request.Adapt<User>();
            user.Id = Guid.NewGuid();
            user.PasswordHash = PasswordHelper.Hash(request.Password);
            user.IsActive = true;
            user.OrganizationId = org.Id;
            // Public registration always creates a Student — role escalation not allowed here
            user.Role = UserRoleType.Student;
            user.IsCompleted = true;

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var times = GetTokenExpires();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return new AuthResponse(
                user.Id,
                accessToken,
                DateTime.UtcNow.AddMinutes(times.Item2),
                refreshToken,
                user.RefreshTokenExpiresAt.Value
            );
        }

        public async Task<AuthResponse?> LoginAsync(string email, string password, string? orgSlug = null)
        {
            // Resolve org for login scope
            Guid? orgId = null;
            if (!string.IsNullOrWhiteSpace(orgSlug))
            {
                var org = await _organizationRepository.GetBySlugAsync(orgSlug);
                if (org == null || !org.IsActive)
                    return null;
                orgId = org.Id;
            }
            else
            {
                var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
                orgId = publicOrg?.Id;
            }

            if (orgId == null)
                return null;

            var user = await _userRepository.GetByEmailInOrgAsync(email, orgId.Value);
            if (user == null || !user.IsActive)
                return null;

            // Check if account is locked out
            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                return null;

            if (!PasswordHelper.Verify(user.PasswordHash, password))
            {
                // Increment failed attempts and lock after configured threshold
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= _authOptions.MaxFailedLoginAttempts)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(_authOptions.LockoutDurationMinutes);
                }
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.SaveChangesAsync();
                return null;
            }

            // Reset lockout on successful login
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var times = GetTokenExpires();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.SaveChangesAsync();

            return new AuthResponse(
                user.Id,
                accessToken,
                DateTime.UtcNow.AddMinutes(times.Item2),
                refreshToken,
                user.RefreshTokenExpiresAt.Value
            );
        }

        public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
            if (user == null)
                return null;

            if (user.RefreshTokenExpiresAt == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
                return null;

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            var times = GetTokenExpires();

            // Rotate refresh token to prevent reuse of stolen tokens
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.SaveChangesAsync();

            return new AuthResponse(
                user.Id,
                newAccessToken,
                DateTime.UtcNow.AddMinutes(times.Item2),
                newRefreshToken,
                user.RefreshTokenExpiresAt.Value
            );
        }

        private (int, int) GetTokenExpires()
        {
            int numberOfDaysForRefresh = 30;
            int numberOfMinForAccessToken = 15;
            var jwt = _configuration.GetSection("Jwt");

            if (jwt is not null && !string.IsNullOrEmpty(jwt["RefreshTokenDays"]))
                int.TryParse(jwt["RefreshTokenDays"], out numberOfDaysForRefresh);

            if (jwt is not null && !string.IsNullOrEmpty(jwt["AccessTokenMinutes"]))
                int.TryParse(jwt["AccessTokenMinutes"], out numberOfMinForAccessToken);

            return (numberOfDaysForRefresh, numberOfMinForAccessToken);
        }

        public async Task ForgotPasswordAsync(string email, string? orgSlug = null)
        {
            Guid? orgId = null;
            if (!string.IsNullOrWhiteSpace(orgSlug))
            {
                var org = await _organizationRepository.GetBySlugAsync(orgSlug);
                orgId = org?.Id;
            }
            else
            {
                var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
                orgId = publicOrg?.Id;
            }

            // Always return success to prevent email enumeration
            if (orgId == null) return;

            var user = await _userRepository.GetByEmailInOrgAsync(email, orgId.Value);
            if (user == null || !user.IsActive)
                return;

            await _verificationService.SendAsync(user.Id, "Email");
        }

        public async Task<bool> ResetPasswordAsync(string email, string otp, string newPassword, string? orgSlug = null)
        {
            Guid? orgId = null;
            if (!string.IsNullOrWhiteSpace(orgSlug))
            {
                var org = await _organizationRepository.GetBySlugAsync(orgSlug);
                orgId = org?.Id;
            }
            else
            {
                var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
                orgId = publicOrg?.Id;
            }

            if (orgId == null) return false;

            var user = await _userRepository.GetByEmailInOrgAsync(email, orgId.Value);
            if (user == null || !user.IsActive)
                return false;

            var isValid = await _verificationService.VerifyAsync(user.Id, otp);
            if (!isValid)
                return false;

            user.PasswordHash = PasswordHelper.Hash(newPassword);
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            user.RefreshToken = null;
            user.RefreshTokenExpiresAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.SaveChangesAsync();
            return true;
        }
    }
}

