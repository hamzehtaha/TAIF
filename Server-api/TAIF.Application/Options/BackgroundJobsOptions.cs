namespace TAIF.Application.Options;

public class BackgroundJobsOptions
{
    public const string SectionName = "BackgroundJobs";

    public JobOptions Maintenance { get; set; } = new() { Enabled = true, IntervalSeconds = 21600, InitialDelaySeconds = 120 };
    public JobOptions SubscriptionExpiry { get; set; } = new() { Enabled = true, IntervalSeconds = 3600, InitialDelaySeconds = 30 };
    public JobOptions VideoPolling { get; set; } = new() { Enabled = true, IntervalSeconds = 10, InitialDelaySeconds = 5 };
    public JobOptions Statistics { get; set; } = new() { Enabled = true, IntervalSeconds = 21600, InitialDelaySeconds = 60 };
}

public class JobOptions
{
    public bool Enabled { get; set; } = true;
    public int IntervalSeconds { get; set; }
    public int InitialDelaySeconds { get; set; }

    public TimeSpan Interval => TimeSpan.FromSeconds(IntervalSeconds);
    public TimeSpan InitialDelay => TimeSpan.FromSeconds(InitialDelaySeconds);
}
