namespace TAIF.Application.Options;

public class RecommendationOptions
{
    public const string SectionName = "Recommendation";

    public int DefaultCount { get; set; } = 10;
    public int MaxCount { get; set; } = 50;
    public double MinBehaviorFactor { get; set; } = 0.7;
    public double MaxBehaviorFactor { get; set; } = 1.8;
    public double DaysPerMonth { get; set; } = 30.0;
    public double GlobalMonthlyDecayRate { get; set; } = 0.15;
}
