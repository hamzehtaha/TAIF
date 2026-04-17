namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Audit record for each promo code redemption.
    /// Used to enforce per-user usage limits.
    /// </summary>
    public class PromoCodeUsage
    {
        public Guid Id { get; set; }
        public Guid PromoCodeId { get; set; }
        public Guid UserId { get; set; }
        public Guid UserSubscriptionId { get; set; }
        public DateTime UsedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public PromoCode PromoCode { get; set; } = null!;
        public User User { get; set; } = null!;
        public UserSubscription UserSubscription { get; set; } = null!;
    }
}
