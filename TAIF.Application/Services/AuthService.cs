using System.Security.Cryptography;
using System.Text;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService
    )
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }
    public async Task<AuthResponse> RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password
        )
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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse(
            accessToken,
            DateTime.UtcNow.AddMinutes(15),
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
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return new AuthResponse(
            accessToken,
            DateTime.UtcNow.AddMinutes(15),
            refreshToken,
            user.RefreshTokenExpiresAt.Value
        );
    }
    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);

        if (user == null)
            return null;

        if (user.RefreshTokenExpiresAt == null ||
            user.RefreshTokenExpiresAt < DateTime.UtcNow)
            return null;
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return new AuthResponse(
            newAccessToken,
            DateTime.UtcNow.AddMinutes(15),
            newRefreshToken,
            user.RefreshTokenExpiresAt.Value
        );
    }

}
