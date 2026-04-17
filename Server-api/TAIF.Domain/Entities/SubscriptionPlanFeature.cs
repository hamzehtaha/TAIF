namespace TAIF.Domain.Entities
{
    /// <summary>
    /// A single feature flag/limit value for a subscription plan.
    /// Value is always a string for maximum flexibility:
    ///   bool features  → "true" or "false"
    ///   string features → "720p", "1080p"
    /// </summary>
    public class SubscriptionPlanFeature
    {
        public Guid Id { get; set; }
        public Guid PlanId { get; set; }
        public PlanFeatureKey FeatureKey { get; set; }
        public string Value { get; set; } = null!;

        // Navigation
        public SubscriptionPlan Plan { get; set; } = null!;
    }
}
