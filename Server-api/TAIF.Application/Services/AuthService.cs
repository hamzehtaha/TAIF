using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganizationRepository _organizationRepository;
    private readonly IInstructorProfileRepository _instructorProfileRepository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IOrganizationRepository organizationRepository,
        IInstructorProfileRepository instructorProfileRepository,
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
        {
            throw new Exception("User already exists");
        }

        var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
        if (publicOrg == null)
        {
            throw new Exception("Public organization not found. Please run seeders first.");
        }

        bool isCompleted = request.UserRoleType == UserRoleType.SystemAdmin || request.UserRoleType == UserRoleType.Student;

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            IsActive = true,
            Birthday = request.Birthday,
            Role = request.UserRoleType,
            OrganizationId = request.UserRoleType == UserRoleType.SystemAdmin ? null : publicOrg.Id,
            IsCompleted = isCompleted
        };

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user);
        var times = GetTokenExpires();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);
        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return new AuthResponse(
            accessToken,
            DateTime.UtcNow.AddMinutes(times.Item2),
            refreshToken,
            user.RefreshTokenExpiresAt.Value
        );
    }

    public async Task<AuthResponse> RegisterInstructorAsync(RegisterInstructorRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing is not null)
        {
            throw new Exception("User already exists");
        }

        var publicOrg = await _organizationRepository.GetPublicOrganizationAsync();
        if (publicOrg == null)
        {
            throw new Exception("Public organization not found. Please run seeders first.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            IsActive = true,
            Birthday = request.Birthday,
            Role = UserRoleType.Instructor,
            OrganizationId = publicOrg.Id,
            IsCompleted = false
        };

        var instructorProfile = new InstructorProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OrganizationId = publicOrg.Id,
            YearsOfExperience = request.YearsOfExperience,
            Rating = 0m,
            CoursesCount = 0
        };

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user);
        var times = GetTokenExpires();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);

        await _userRepository.AddAsync(user);
        await _instructorProfileRepository.AddAsync(instructorProfile);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse(
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

        if (user.PasswordHash != HashPassword(password))
            return null;

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user);
        var times = GetTokenExpires();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(times.Item1);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return new AuthResponse(
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
        {
            return null;
        }
        if (user.RefreshTokenExpiresAt == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            return null;
        }
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var times = GetTokenExpires();
        return new AuthResponse(
            newAccessToken,
            DateTime.UtcNow.AddMinutes(times.Item2),
            user.RefreshToken ?? "",
            user.RefreshTokenExpiresAt.Value
        );
    }
    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
    private (int,int) GetTokenExpires()
    {
        try
        {
            int numberOfDaysForRefresh = 30;
            int numberOfMinForAccessToken = 15;
            var jwt = _configuration.GetSection("Jwt");
            if (jwt is not null && !String.IsNullOrEmpty(jwt["RefreshTokenDays"]))
            {
                int.TryParse(jwt["RefreshTokenDays"], out numberOfDaysForRefresh);
            }
            if (jwt is not null && !String.IsNullOrEmpty(jwt["AccessTokenMinutes"]))
            {
                int.TryParse(jwt["AccessTokenMinutes"], out numberOfMinForAccessToken);
            }

            return (numberOfDaysForRefresh,numberOfMinForAccessToken);
        }
        catch (Exception ex)
        {

            throw new Exception("Error while GetTokenExpires");
        }
    }
}
