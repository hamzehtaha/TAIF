using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ICurrencyRateRepository : IRepository<CurrencyRate>
    {
        /// <summary>Get the rate for a specific currency code (case-insensitive).</summary>
        Task<CurrencyRate?> GetByCurrencyCodeAsync(string currencyCode);

        /// <summary>Get all active (non-deleted) currency rates.</summary>
        Task<List<CurrencyRate>> GetAllRatesAsync();

        /// <summary>Check if a currency code already exists.</summary>
        Task<bool> CurrencyExistsAsync(string currencyCode);

        /// <summary>Bulk upsert rates — updates existing codes, inserts new ones.</summary>
        Task UpsertRatesAsync(Dictionary<string, decimal> rates);
    }
}
