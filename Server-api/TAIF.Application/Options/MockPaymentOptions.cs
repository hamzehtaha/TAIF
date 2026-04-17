namespace TAIF.Application.Options
{
    public class MockPaymentOptions
    {
        public const string SectionName = "MockPayment";

        /// <summary>When true every charge succeeds. Set false to enable failure simulation.</summary>
        public bool AlwaysSucceed { get; set; } = true;

        /// <summary>When > 0, charges above this amount will fail (ignored if AlwaysSucceed = true).</summary>
        public decimal FailForAmountsAbove { get; set; } = 0;

        /// <summary>Specific user IDs that always fail (ignored if AlwaysSucceed = true).</summary>
        public List<Guid> FailForUserIds { get; set; } = [];

        /// <summary>Currencies that always fail, e.g. ["EUR","GBP"] (ignored if AlwaysSucceed = true).</summary>
        public List<string> FailForCurrencies { get; set; } = [];

        /// <summary>Random failure rate 0.0–1.0 (e.g. 0.3 = 30% chance of failure). Applied after other checks. Ignored if AlwaysSucceed = true.</summary>
        public double FailureRate { get; set; } = 0;

        /// <summary>Simulated processing delay in milliseconds (0 = no delay).</summary>
        public int SimulateDelayMs { get; set; } = 0;
    }
}
