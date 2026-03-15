using TAIF.Application.DTOs.Verification;

namespace TAIF.Application.Interfaces.Services;

/// <summary>
/// Delivery abstraction for verification codes.
/// Implement this interface to add a new channel (SMS, WhatsApp, push, etc.)
/// without touching any business logic.
/// </summary>
public interface IVerificationChannel
{
    /// <summary>Unique name used to resolve this channel by name, e.g. "Email", "SMS", "WhatsApp".</summary>
    string ChannelName { get; }

    Task SendAsync(VerificationMessage message, CancellationToken ct = default);
}
