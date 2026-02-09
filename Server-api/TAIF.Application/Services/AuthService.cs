using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    public AuthService(IUserRepository userRepository,ITokenService tokenService,IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _configuration = configuration;
    }
    public async Task<AuthResponse> RegisterAsync(string firstName,string lastName,string email,string password)
    {
        var existing = await _userRepository.GetByEmailAsync(email);
        if (existing != null)
            throw new Exception("User already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PasswordHash = HashPassword(password),
            IsActive = true,
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
