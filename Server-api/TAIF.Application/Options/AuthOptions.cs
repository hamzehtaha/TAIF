namespace TAIF.Application.Options;

public class AuthOptions
{
    public const string SectionName = "Auth";

    public int MaxFailedLoginAttempts { get; set; } = 5;
    public int LockoutDurationMinutes { get; set; } = 15;
}
