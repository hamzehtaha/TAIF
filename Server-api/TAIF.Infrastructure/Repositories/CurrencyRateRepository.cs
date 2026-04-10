using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class CurrencyRateRepository : RepositoryBase<CurrencyRate>, ICurrencyRateRepository
    {
        private readonly TaifDbContext _context;

        public CurrencyRateRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<CurrencyRate?> GetByCurrencyCodeAsync(string currencyCode)
        {
            var normalized = currencyCode.ToUpperInvariant();
            return await _context.CurrencyRates
                .FirstOrDefaultAsync(r => r.CurrencyCode == normalized && !r.IsDeleted);
        }

        public async Task<List<CurrencyRate>> GetAllRatesAsync()
        {
            return await _context.CurrencyRates
                .Where(r => !r.IsDeleted)
                .OrderBy(r => r.CurrencyCode)
                .ToListAsync();
        }

        public async Task<bool> CurrencyExistsAsync(string currencyCode)
        {
            var normalized = currencyCode.ToUpperInvariant();
            return await _context.CurrencyRates
                .AnyAsync(r => r.CurrencyCode == normalized && !r.IsDeleted);
        }

        public async Task UpsertRatesAsync(Dictionary<string, decimal> rates)
        {
            var now = DateTime.UtcNow;

            foreach (var (code, rate) in rates)
            {
                var normalized = code.ToUpperInvariant();
                var existing = await _context.CurrencyRates
                    .FirstOrDefaultAsync(r => r.CurrencyCode == normalized && !r.IsDeleted);

                if (existing != null)
                {
                    existing.RateToUsd = rate;
                    existing.LastUpdatedAt = now;
                    existing.UpdatedAt = now;
                }
                else
                {
                    await _context.CurrencyRates.AddAsync(new CurrencyRate
                    {
                        Id = Guid.NewGuid(),
                        CurrencyCode = normalized,
                        RateToUsd = rate,
                        LastUpdatedAt = now,
                        CreatedAt = now,
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
