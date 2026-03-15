using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.DTOs.Verification;
using TAIF.Application.Interfaces.Services;

namespace TAIF.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VerificationController : TaifControllerBase
{
    private readonly IVerificationService _verificationService;
    private readonly ILogger<VerificationController> _logger;

    public VerificationController(
        IVerificationService verificationService,
        ILogger<VerificationController> logger)
    {
        _verificationService = verificationService;
        _logger = logger;
    }

    /// <summary>
    /// Sends (or resends) a verification OTP to the authenticated user.
    /// Calling this revokes any previously issued code.
    /// </summary>
    /// <param name="channel">Delivery channel: "Email" (default), "SMS", "WhatsApp".</param>
    /// <param name="locale">Optional BCP-47 locale for message language, e.g. "ar", "en".</param>
    [HttpPost("send")]
    public async Task<IActionResult> Send(
        [FromQuery] string channel = "Email",
        [FromQuery] string? locale = null)
    {
        await _verificationService.SendAsync(UserId, channel, locale);
        return Ok(ApiResponse<string>.SuccessResponse(
            $"Verification code sent via {channel}"));
    }

    /// <summary>
    /// Verifies the OTP submitted by the user (from a form/API call).
    /// On success, EmailVerified is set to true and the code is invalidated.
    /// </summary>
    [HttpPost("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify([FromBody] VerifyCodeRequest request)
    {
        var success = await _verificationService.VerifyAsync(request.UserId, request.Code);

        if (!success)
            return BadRequest(ApiResponse<string>.FailResponse(
                "Invalid or expired verification code."));

        return Ok(ApiResponse<string>.SuccessResponse("Email verified successfully."));
    }

    /// <summary>
    /// One-click verification via the link sent in the email.
    /// Returns an HTML page — designed to be opened directly in a browser.
    /// </summary>
    [HttpGet("verify")]
    [AllowAnonymous]
    public async Task<ContentResult> VerifyViaLink([FromQuery] Guid userId, [FromQuery] string code)
    {
        var success = await _verificationService.VerifyAsync(userId, code);
        var html = success ? BuildSuccessPage() : BuildErrorPage();
        return Content(html, "text/html");
    }

    // ── HTML pages ────────────────────────────────────────────

    private static string BuildSuccessPage() => """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified — TAIF</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #f4f6f9;
                   display: flex; align-items: center; justify-content: center;
                   min-height: 100vh; padding: 20px; }
            .card { background: #fff; border-radius: 12px; padding: 48px 40px;
                    max-width: 440px; width: 100%; text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,.08); }
            .icon { font-size: 64px; margin-bottom: 24px; }
            h1 { font-size: 22px; color: #1a202c; margin-bottom: 12px; }
            p  { font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 8px; }
            .badge { display: inline-block; background: #d1fae5; color: #065f46;
                     font-size: 13px; font-weight: 600; padding: 4px 14px;
                     border-radius: 99px; margin-bottom: 28px; }
            .brand { margin-top: 32px; font-size: 13px; color: #a0aec0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>Email Verified!</h1>
            <span class="badge">Registration Complete</span>
            <p>Your email address has been successfully verified.</p>
            <p>Your TAIF account is now active. You can close this tab and log in to the app.</p>
            <div class="brand">TAIF Platform</div>
          </div>
        </body>
        </html>
        """;

    private static string BuildErrorPage() => """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed — TAIF</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #f4f6f9;
                   display: flex; align-items: center; justify-content: center;
                   min-height: 100vh; padding: 20px; }
            .card { background: #fff; border-radius: 12px; padding: 48px 40px;
                    max-width: 440px; width: 100%; text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,.08); }
            .icon { font-size: 64px; margin-bottom: 24px; }
            h1 { font-size: 22px; color: #1a202c; margin-bottom: 12px; }
            p  { font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 8px; }
            .badge { display: inline-block; background: #fee2e2; color: #991b1b;
                     font-size: 13px; font-weight: 600; padding: 4px 14px;
                     border-radius: 99px; margin-bottom: 28px; }
            .hint { font-size: 13px; color: #718096; margin-top: 20px;
                    background: #f7fafc; border-radius: 8px; padding: 12px 16px; }
            .brand { margin-top: 28px; font-size: 13px; color: #a0aec0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h1>Verification Failed</h1>
            <span class="badge">Link Invalid or Expired</span>
            <p>This verification link is no longer valid.</p>
            <p>Verification links expire after 15 minutes and can only be used once.</p>
            <div class="hint">Open the app and request a new verification code from your profile.</div>
            <div class="brand">TAIF Platform</div>
          </div>
        </body>
        </html>
        """;
}
