namespace TAIF.Application.Options;

public class VerificationOptions
{
    public const string SectionName = "Verification";

    /// <summary>How many minutes the OTP stays valid. Default: 15.</summary>
    public int OtpExpiryMinutes { get; set; } = 15;

    /// <summary>Channel used when none is specified. Default: "Email".</summary>
    public string DefaultChannel { get; set; } = "Email";
}
