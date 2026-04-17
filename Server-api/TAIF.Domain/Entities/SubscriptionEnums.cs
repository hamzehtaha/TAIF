namespace TAIF.Domain.Entities
{
    public enum SubscriptionStatus
    {
        Trialing  = 0,   // Within trial period — access granted, payment pending
        Active    = 1,   // Paid and active
        PastDue   = 2,   // Payment failed; grace period before expiry
        Cancelled = 3,   // User cancelled — access continues until EndDate
        Expired   = 4,   // Past EndDate; access revoked (falls back to Free behaviour)
    }

    public enum BillingCycle
    {
        Monthly = 0,
        Yearly  = 1,
    }

    /// <summary>
    /// Feature flag keys used to control plan abilities.
    /// Add new keys here as the platform grows; set values per plan in SubscriptionPlanFeature rows.
    /// bool features:   "true" | "false"
    /// string features: e.g. "720p" | "1080p"
    /// </summary>
    public enum PlanFeatureKey
    {
        CanAccessPaidCourses   = 0,   // bool  — true for Basic+
        CanAccessLearningPaths = 1,   // bool  — true for Basic+
        MaxVideoQuality        = 2,   // string — "480p" | "720p" | "1080p"
        // Future features — just add here and seed plan rows
        // CanDownloadCertificate = 3,
        // CanUseAiPlan          = 4,
        // MaxTeamMembers        = 5,
    }

    public enum PaymentStatus
    {
        Pending   = 0,
        Completed = 1,
        Failed    = 2,
        Refunded  = 3,
    }
}
