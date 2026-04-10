namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Defines a subscription tier (e.g., Free, Basic, Pro).
    /// Platform-wide — not scoped to any organisation.
    /// YearlyDiscountPercent: the % discount applied when billing yearly (e.g. 30 = 30% off).
    /// TrialDaysCount 0 means no free trial.
    /// </summary>
    public class SubscriptionPlan : Base
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public decimal YearlyDiscountPercent { get; set; } = 0;
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;       // false = admin-assigned only
        public int DisplayOrder { get; set; } = 0;
        public int TrialDaysCount { get; set; } = 0;

        // Navigation
        public ICollection<SubscriptionPlanFeature> Features { get; set; } = new List<SubscriptionPlanFeature>();
        public ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
    }
}
