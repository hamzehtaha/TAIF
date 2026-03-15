using Mapster;
using Microsoft.Extensions.Configuration;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
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

        public AuthService(
            IUserRepository userRepository,
            IOrganizationRepository organizationRepository,
            IInstructorRepository instructorProfileRepository,
            ITokenService tokenService,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _organizationRepository = organizationRepository;
            _instructorProfileRepository = instructorProfileRepository;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing is not null)
                throw new Exception("User already exists");

            var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
            if (publicOrg == null)
                throw new Exception("Public organization not found. Please run seeders first.");

            var user = request.Adapt<User>();
            user.Id = Guid.NewGuid();
            user.PasswordHash = PasswordHelper.Hash(request.Password);
            user.IsActive = true;
            user.OrganizationId = publicOrg.Id;
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

        public async Task<AuthResponse?> LoginAsync(string email, string password)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null || !user.IsActive)
                return null;

            if (!PasswordHelper.Verify(user.PasswordHash, password))
                return null;

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
            var times = GetTokenExpires();

            return new AuthResponse(
                user.Id,
                newAccessToken,
                DateTime.UtcNow.AddMinutes(times.Item2),
                user.RefreshToken ?? "",
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
    }
}

