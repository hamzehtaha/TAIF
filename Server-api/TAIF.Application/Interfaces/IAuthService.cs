using TAIF.Application.DTOs;

namespace TAIF.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(
        string firstName,
        string lastName,
        string email,
        string password
    );
    Task<AuthResponse?> LoginAsync(string email, string password);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);


}
