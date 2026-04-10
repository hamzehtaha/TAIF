using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Payments;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.Payments
{
    /// <summary>
    /// Stub payment gateway for development and testing.
    /// Controlled via appsettings.json "MockPayment" section.
    /// Supports: AlwaysSucceed, FailForAmountsAbove, FailForUserIds,
    /// FailForCurrencies, FailureRate, SimulateDelayMs.
    /// Replace this registration in Program.cs with a real provider for production.
    /// </summary>
    public class MockPaymentGateway : IPaymentGateway
    {
        private readonly MockPaymentOptions _options;
        private readonly ILogger<MockPaymentGateway> _logger;
        private static readonly Random _random = new();

        public string GatewayName => "MockGateway";

        public MockPaymentGateway(IOptions<MockPaymentOptions> options, ILogger<MockPaymentGateway> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task<PaymentGatewayResult> ChargeAsync(PaymentGatewayRequest request, CancellationToken ct = default)
        {
            _logger.LogInformation(
                "MockPaymentGateway: charging {Amount} {Currency} for UserId={UserId} SubscriptionId={SubscriptionId}",
                request.Amount, request.Currency, request.UserId, request.SubscriptionId);

            if (_options.SimulateDelayMs > 0)
                await Task.Delay(_options.SimulateDelayMs, ct);

            if (_options.AlwaysSucceed)
                return Success(request);

            if (_options.FailForAmountsAbove > 0 && request.Amount > _options.FailForAmountsAbove)
            {
                _logger.LogWarning(
                    "MockPaymentGateway: simulating failure — amount {Amount} exceeds FailForAmountsAbove={Threshold}",
                    request.Amount, _options.FailForAmountsAbove);
                return Fail(request, "amount_exceeds_limit",
                    $"Simulated failure: charge of {request.Amount} {request.Currency} exceeds the configured limit.");
            }

            if (_options.FailForUserIds.Contains(request.UserId))
            {
                _logger.LogWarning(
                    "MockPaymentGateway: simulating failure — UserId {UserId} is in FailForUserIds list",
                    request.UserId);
                return Fail(request, "user_blocked",
                    $"Simulated failure: payment blocked for user {request.UserId}.");
            }

            if (_options.FailForCurrencies.Contains(request.Currency, StringComparer.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "MockPaymentGateway: simulating failure — currency {Currency} is in FailForCurrencies list",
                    request.Currency);
                return Fail(request, "currency_not_supported",
                    $"Simulated failure: currency {request.Currency} is not supported.");
            }

            if (_options.FailureRate > 0 && _random.NextDouble() < _options.FailureRate)
            {
                _logger.LogWarning(
                    "MockPaymentGateway: simulating random failure — FailureRate={Rate}",
                    _options.FailureRate);
                return Fail(request, "random_failure",
                    "Simulated failure: random failure triggered by configured failure rate.");
            }

            return Success(request);
        }

        private static PaymentGatewayResult Success(PaymentGatewayRequest request)
        {
            var txnId = $"mock_{Guid.NewGuid():N}";
            return new PaymentGatewayResult(
                Success: true,
                TransactionId: txnId,
                RawResponse: $"{{\"transactionId\":\"{txnId}\",\"amount\":{request.Amount},\"currency\":\"{request.Currency}\"}}",
                ErrorMessage: null
            );
        }

        private static PaymentGatewayResult Fail(PaymentGatewayRequest request, string errorCode, string errorMessage)
        {
            return new PaymentGatewayResult(
                Success: false,
                TransactionId: null,
                RawResponse: $"{{\"error\":\"{errorCode}\",\"amount\":{request.Amount},\"currency\":\"{request.Currency}\"}}",
                ErrorMessage: errorMessage
            );
        }
    }
}
