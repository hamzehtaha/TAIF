namespace TAIF.Application.DTOs.Responses
{
    public record AuthResponse(
        Guid UserId,
        string AccessToken,
        DateTime AccessTokenExpiresAt,
        string RefreshToken,
        DateTime RefreshTokenExpiresAt);
}
