namespace TAIF.Application.Interfaces.Payments
{
    /// <summary>
    /// Single integration point for all payment providers.
    /// Swap the registered implementation in Program.cs to change gateway — zero other changes needed.
    /// </summary>
    public interface IPaymentGateway
    {
        string GatewayName { get; }
        Task<PaymentGatewayResult> ChargeAsync(PaymentGatewayRequest request, CancellationToken ct = default);
    }

    public record PaymentGatewayRequest(
        Guid UserId,
        Guid SubscriptionId,
        decimal Amount,
        string Currency
    );

    public record PaymentGatewayResult(
        bool Success,
        string? TransactionId,
        string? RawResponse,
        string? ErrorMessage
    );
}
