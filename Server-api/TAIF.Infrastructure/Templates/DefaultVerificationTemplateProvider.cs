using Microsoft.Extensions.Options;
using TAIF.Application.DTOs.Verification;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;
using TAIF.Domain.Entities;

namespace TAIF.Infrastructure.Templates;

/// <summary>
/// Default verification template provider.
///
/// HOW TO CUSTOMISE:
///   - Change copy/branding: edit the HTML strings in BuildEmailBody() / BuildSmsBody().
///   - Add a language: add a case to the locale switch inside each method.
///   - Use file/DB templates: replace this class with your own IVerificationTemplateProvider
///     implementation and register it in Program.cs — no other code changes needed.
/// </summary>
public class DefaultVerificationTemplateProvider : IVerificationTemplateProvider
{
    private readonly VerificationOptions _options;

    public DefaultVerificationTemplateProvider(IOptions<VerificationOptions> options)
    {
        _options = options.Value;
    }

    public VerificationMessage Build(User user, string otp, string channel, string? locale = null)
    {
        return channel.Equals("Email", StringComparison.OrdinalIgnoreCase)
            ? BuildEmailMessage(user, otp, locale)
            : BuildPlainTextMessage(user, otp, channel, locale);
    }

    // ──────────────────────────────────────────────────────────
    // EMAIL  (HTML, easy to reskin)
    // ──────────────────────────────────────────────────────────
    private VerificationMessage BuildEmailMessage(User user, string otp, string? locale)
    {
        var verifyLink = $"{_options.VerificationBaseUrl}/api/verification/verify?userId={user.Id}&code={otp}";

        var (subject, greeting, instruction, btnText, orText, footer) = locale?.ToLower() switch
        {
            "ar" => (
                "أكمل تسجيلك في TAIF — تحقق من بريدك الإلكتروني",
                $"مرحباً بك في TAIF، {user.FirstName}!",
                $"شكراً لتسجيلك. خطوة أخيرة — تحقق من بريدك الإلكتروني لتفعيل حسابك والبدء باستخدام TAIF. الرمز صالح لمدة {_options.OtpExpiryMinutes} دقيقة.",
                "تفعيل حسابي",
                "أو أدخل الرمز يدوياً في التطبيق",
                "إذا لم تقم بإنشاء حساب في TAIF، يمكنك تجاهل هذا البريد بأمان."
            ),
            _ => (
                "Complete your TAIF registration — Verify your email",
                $"Welcome to TAIF, {user.FirstName}!",
                $"Thanks for signing up. One last step — verify your email address to activate your account and start using TAIF. This link expires in {_options.OtpExpiryMinutes} minutes.",
                "Activate my account",
                "Or enter the code manually in the app",
                "If you didn't create a TAIF account, you can safely ignore this email."
            )
        };

        var body = $"""
            <!DOCTYPE html>
            <html lang="{locale ?? "en"}">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:20px;background:#f4f6f9;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table width="480" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                      <tr>
                        <td style="padding-bottom:24px;border-bottom:1px solid #e8ecf0;">
                          <h1 style="margin:0;font-size:22px;color:#1a202c;">TAIF</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:28px;">
                          <p style="margin:0 0 8px;font-size:15px;color:#4a5568;">{greeting}</p>
                          <p style="margin:0 0 28px;font-size:15px;color:#4a5568;">{instruction}</p>

                          <!-- One-click verify button -->
                          <div style="text-align:center;margin-bottom:28px;">
                            <a href="{verifyLink}"
                               style="display:inline-block;padding:14px 36px;background:#3b82f6;color:#ffffff;
                                      text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                              {btnText}
                            </a>
                          </div>

                          <!-- Divider -->
                          <p style="text-align:center;font-size:13px;color:#a0aec0;margin:0 0 20px;">{orText}</p>

                          <!-- Numeric code -->
                          <div style="background:#edf2f7;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                            <span style="font-size:42px;letter-spacing:12px;font-weight:700;
                                         color:#2d3748;font-family:'Courier New',monospace;">{otp}</span>
                          </div>

                          <p style="margin:0;font-size:13px;color:#a0aec0;">{footer}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        return new VerificationMessage(user.Email, body, subject);
    }

    // ──────────────────────────────────────────────────────────
    // SMS / WHATSAPP  (plain text, short)
    // ──────────────────────────────────────────────────────────
    private VerificationMessage BuildPlainTextMessage(User user, string otp, string channel, string? locale)
    {
        var text = locale?.ToLower() switch
        {
            "ar" => $"رمز التحقق من TAIF: {otp} — صالح لمدة {_options.OtpExpiryMinutes} دقيقة. لا تشاركه مع أحد.",
            _ => $"Your TAIF verification code: {otp} — valid for {_options.OtpExpiryMinutes} minutes. Do not share it."
        };

        // For SMS/WhatsApp the recipient is the user's phone number (stored elsewhere);
        // here we fall back to email so the service compiles — update when phone is added to User.
        var recipient = user.Email;

        return new VerificationMessage(recipient, text);
    }
}
