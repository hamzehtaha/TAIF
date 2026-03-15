namespace TAIF.Application.Options;

public class VerificationOptions
{
    public const string SectionName = "Verification";

    /// <summary>How many minutes the OTP stays valid. Default: 15.</summary>
    public int OtpExpiryMinutes { get; set; } = 15;

    /// <summary>Channel used when none is specified. Default: "Email".</summary>
    public string DefaultChannel { get; set; } = "Email";

    /// <summary>
    /// Base URL used to build the one-click verification link inside emails.
    /// Point to your API in dev, or to your frontend page in production.
    /// Example: "https://app.taif.com" or "http://localhost:5065"
    /// </summary>
    public string VerificationBaseUrl { get; set; } = "http://localhost:5065";
}
