using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using TAIF.Application.DTOs.Verification;
using TAIF.Application.Interfaces.Services;
using TAIF.Infrastructure.Options;

namespace TAIF.Infrastructure.Channels;

/// <summary>
/// Delivers verification OTPs via SMTP email using MailKit.
/// To switch providers (SendGrid, SES, etc.) replace this class —
/// the interface and all business logic stay unchanged.
/// </summary>
public class EmailVerificationChannel : IVerificationChannel
{
    private readonly EmailOptions _options;
    private readonly ILogger<EmailVerificationChannel> _logger;

    public string ChannelName => "Email";

    public EmailVerificationChannel(
        IOptions<EmailOptions> options,
        ILogger<EmailVerificationChannel> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(VerificationMessage message, CancellationToken ct = default)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        email.To.Add(MailboxAddress.Parse(message.Recipient));
        email.Subject = message.Subject ?? "Verify your email";

        var builder = new BodyBuilder { HtmlBody = message.Body };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();

        var socketOptions = _options.EnableSsl
            ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;

        await smtp.ConnectAsync(_options.Host, _options.Port, socketOptions, ct);

        if (!string.IsNullOrEmpty(_options.Username))
            await smtp.AuthenticateAsync(_options.Username, _options.Password, ct);

        await smtp.SendAsync(email, ct);
        await smtp.DisconnectAsync(true, ct);

        _logger.LogInformation("Verification email sent to {Recipient}", message.Recipient);
    }
}
