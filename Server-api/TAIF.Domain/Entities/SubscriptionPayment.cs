namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Payment record for a subscription transaction.
    /// GatewayName / GatewayTransactionId / GatewayResponse are populated once
    /// a real payment provider is wired in.
    /// Kept separate from UserSubscription to preserve full payment history.
    /// </summary>
    public class SubscriptionPayment : Base
    {
        public Guid UserSubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public string GatewayName { get; set; } = "Mock";

        // Populated by the payment gateway
        public string? GatewayTransactionId { get; set; }
        public string? GatewayResponse { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? FailureReason { get; set; }

        // Navigation
        public UserSubscription UserSubscription { get; set; } = null!;
    }
}
