namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Stores exchange rates relative to a base currency (USD).
    /// Rates can be updated by an external service or admin API.
    /// </summary>
    public class CurrencyRate : Base
    {
        /// <summary>ISO 4217 currency code (e.g. "EUR", "GBP", "JOD"). Always stored uppercase.</summary>
        public string CurrencyCode { get; set; } = null!;

        /// <summary>Exchange rate relative to USD. Example: EUR = 0.92 means 1 USD = 0.92 EUR.</summary>
        public decimal RateToUsd { get; set; }

        /// <summary>When this rate was last refreshed (from an external source or admin update).</summary>
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
