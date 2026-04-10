namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Promotional discount code.
    /// ApplicablePlanIds: JSON array of SubscriptionPlan Ids this code is valid for.
    ///   null or empty = valid for all plans.
    /// MaxUses null = unlimited total uses.
    /// MaxUsesPerUser null = no per-user cap.
    /// ExpiresAt null = never expires.
    /// </summary>
    public class PromoCode : Base
    {
        public string Code { get; set; } = null!;          // e.g. "SAVE30"
        public string? Description { get; set; }
        public decimal DiscountPercent { get; set; }        // 30 = 30% off
        public int? MaxUses { get; set; }
        public int UsedCount { get; set; } = 0;
        public int? MaxUsesPerUser { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;
        public string? ApplicablePlanIds { get; set; }      // JSON: ["guid","guid"] or null

        // Navigation
        public ICollection<PromoCodeUsage> Usages { get; set; } = new List<PromoCodeUsage>();
    }
}
