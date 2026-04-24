using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;

namespace TAIF.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(string email, string password, string? orgSlug = null);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
    Task ForgotPasswordAsync(string email, string? orgSlug = null);
    Task<bool> ResetPasswordAsync(string email, string otp, string newPassword, string? orgSlug = null);
}
