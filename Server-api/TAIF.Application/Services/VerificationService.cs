using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;

namespace TAIF.Application.Services;

public class VerificationService : IVerificationService
{
    // 6-digit numeric OTP — easy to type, works across all channels (Email, SMS, WhatsApp)
    private const string OtpAlphabet = "0123456789";

    private readonly IUserRepository _userRepository;
    private readonly IEnumerable<IVerificationChannel> _channels;
    private readonly IVerificationTemplateProvider _templateProvider;
    private readonly VerificationOptions _options;

    public VerificationService(
        IUserRepository userRepository,
        IEnumerable<IVerificationChannel> channels,
        IVerificationTemplateProvider templateProvider,
        IOptions<VerificationOptions> options)
    {
        _userRepository = userRepository;
        _channels = channels;
        _templateProvider = templateProvider;
        _options = options.Value;
    }

    public async Task SendAsync(Guid userId, string channel = "Email", string? locale = null, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found");

        var deliveryChannel = _channels.FirstOrDefault(c =>
            c.ChannelName.Equals(channel, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"Verification channel '{channel}' is not registered. " +
               $"Registered channels: {string.Join(", ", _channels.Select(c => c.ChannelName))}");

        // Generate OTP — writing new values revokes any previously stored token
        var otp = RandomNumberGenerator.GetString(OtpAlphabet, 6);
        user.VerificationToken = PasswordHelper.Hash(otp);
        user.VerificationTokenExpiresAt = DateTime.UtcNow.AddMinutes(_options.OtpExpiryMinutes);
        user.VerificationChannel = channel;

        await _userRepository.SaveChangesAsync();

        var message = _templateProvider.Build(user, otp, channel, locale);
        await deliveryChannel.SendAsync(message, ct);
    }

    public async Task<bool> VerifyAsync(Guid userId, string otp)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null) return false;
        if (string.IsNullOrEmpty(user.VerificationToken)) return false;
        if (user.VerificationTokenExpiresAt == null || user.VerificationTokenExpiresAt < DateTime.UtcNow) return false;
        if (!PasswordHelper.Verify(user.VerificationToken, otp)) return false;

        // Mark verified and clear the one-time token
        user.EmailVerified = true;
        user.VerificationToken = null;
        user.VerificationTokenExpiresAt = null;
        user.VerificationChannel = null;

        await _userRepository.SaveChangesAsync();
        return true;
    }
}
