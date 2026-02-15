using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;

namespace TAIF.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> RegisterInstructorAsync(RegisterInstructorRequest request);
    Task<AuthResponse?> LoginAsync(string email, string password);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
}
