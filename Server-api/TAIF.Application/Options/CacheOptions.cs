namespace TAIF.Application.Options;

public class CacheOptions
{
    public const string SectionName = "Cache";

    /// <summary>Default TTL in minutes for cached items.</summary>
    public int DefaultTtlMinutes { get; set; } = 30;

    /// <summary>TTL in minutes for category cache.</summary>
    public int CategoryTtlMinutes { get; set; } = 30;
}
