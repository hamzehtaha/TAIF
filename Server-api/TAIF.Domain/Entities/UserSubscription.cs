namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Represents a user's subscription instance.
    /// One active subscription per user at a time.
    /// Full history is preserved — soft-delete is never used here.
    /// Cancelled status: access continues until EndDate, then becomes Expired.
    /// </summary>
    public class UserSubscription : Base
    {
        public Guid UserId { get; set; }
        public Guid PlanId { get; set; }
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
        public BillingCycle BillingCycle { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }          // null only for potential future Lifetime plans
        public bool AutoRenew { get; set; } = true;

        // Pricing snapshot at time of purchase
        public decimal PaidAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public Guid? PromoCodeId { get; set; }

        // Trial
        public DateTime? TrialEndsAt { get; set; }

        // Cancellation
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }

        // Navigation
        public User User { get; set; } = null!;
        public SubscriptionPlan Plan { get; set; } = null!;
        public PromoCode? PromoCode { get; set; }
        public ICollection<SubscriptionPayment> Payments { get; set; } = new List<SubscriptionPayment>();
    }
}
