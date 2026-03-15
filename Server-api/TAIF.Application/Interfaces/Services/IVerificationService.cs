namespace TAIF.Application.Interfaces.Services;

public interface IVerificationService
{
    /// <summary>
    /// Generates a fresh OTP, revokes any previous token for this user,
    /// persists the hash, and delivers via the requested channel.
    /// </summary>
    Task SendAsync(Guid userId, string channel = "Email", string? locale = null, CancellationToken ct = default);

    /// <summary>
    /// Validates the OTP against the stored hash and expiry.
    /// On success sets <c>EmailVerified = true</c> and clears the stored token.
    /// Returns <c>false</c> for invalid, expired, or already-used codes.
    /// </summary>
    Task<bool> VerifyAsync(Guid userId, string otp);
}
