using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Infrastructure.Services
{
    /// <summary>
    /// Database-backed currency conversion service.
    /// Reads exchange rates from the CurrencyRates table (relative to USD).
    /// Rates can be updated via admin API or an external scheduled service.
    /// </summary>
    public class DbCurrencyConversionService : ICurrencyConversionService
    {
        private readonly ICurrencyRateRepository _rateRepo;

        public DbCurrencyConversionService(ICurrencyRateRepository rateRepo)
        {
            _rateRepo = rateRepo;
        }

        public async Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency)
        {
            if (string.Equals(fromCurrency, toCurrency, StringComparison.OrdinalIgnoreCase))
                return amount;

            var rate = await GetRateAsync(fromCurrency, toCurrency);
            return Math.Round(amount * rate, 2);
        }

        public async Task<decimal> GetRateAsync(string fromCurrency, string toCurrency)
        {
            if (string.Equals(fromCurrency, toCurrency, StringComparison.OrdinalIgnoreCase))
                return 1.0m;

            var fromRate = await GetUsdRateAsync(fromCurrency);
            var toRate = await GetUsdRateAsync(toCurrency);

            return toRate / fromRate;
        }

        public async Task<List<string>> GetSupportedCurrenciesAsync()
        {
            var rates = await _rateRepo.GetAllRatesAsync();
            return rates.Select(r => r.CurrencyCode).OrderBy(c => c).ToList();
        }

        public async Task<Dictionary<string, decimal>> GetAllRatesAsync()
        {
            var rates = await _rateRepo.GetAllRatesAsync();
            return rates.ToDictionary(r => r.CurrencyCode, r => r.RateToUsd);
        }

        public async Task UpsertRatesAsync(Dictionary<string, decimal> rates)
        {
            await _rateRepo.UpsertRatesAsync(rates);
        }

        public async Task SetRateAsync(string currencyCode, decimal rateToUsd)
        {
            var normalized = currencyCode.ToUpperInvariant();
            var existing = await _rateRepo.GetByCurrencyCodeAsync(normalized);
            var now = DateTime.UtcNow;

            if (existing != null)
            {
                existing.RateToUsd = rateToUsd;
                existing.LastUpdatedAt = now;
                existing.UpdatedAt = now;
                _rateRepo.Update(existing, r => r.RateToUsd, r => r.LastUpdatedAt);
            }
            else
            {
                await _rateRepo.AddAsync(new CurrencyRate
                {
                    Id = Guid.NewGuid(),
                    CurrencyCode = normalized,
                    RateToUsd = rateToUsd,
                    LastUpdatedAt = now,
                });
            }

            await _rateRepo.SaveChangesAsync();
        }

        public async Task RemoveRateAsync(string currencyCode)
        {
            var normalized = currencyCode.ToUpperInvariant();
            var existing = await _rateRepo.GetByCurrencyCodeAsync(normalized)
                ?? throw new KeyNotFoundException($"Currency '{currencyCode}' not found.");

            _rateRepo.SoftDelete(existing);
            await _rateRepo.SaveChangesAsync();
        }

        private async Task<decimal> GetUsdRateAsync(string currency)
        {
            var normalized = currency.ToUpperInvariant();

            // USD is always 1.0 — no DB lookup needed
            if (normalized == "USD")
                return 1.0m;

            var rate = await _rateRepo.GetByCurrencyCodeAsync(normalized)
                ?? throw new InvalidOperationException(
                    $"Currency '{currency}' is not supported. Add it via the admin API or seed data.");

            return rate.RateToUsd;
        }
    }
}
