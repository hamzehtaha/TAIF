namespace TAIF.Application.Options;

public class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public RateLimitPolicy Auth { get; set; } = new() { PermitLimit = 10, WindowSeconds = 60 };
    public RateLimitPolicy Verification { get; set; } = new() { PermitLimit = 5, WindowSeconds = 300 };
    public RateLimitPolicy? Global { get; set; } = new() { PermitLimit = 100, WindowSeconds = 60 };
}

public class RateLimitPolicy
{
    public int PermitLimit { get; set; }
    public int WindowSeconds { get; set; }
}
