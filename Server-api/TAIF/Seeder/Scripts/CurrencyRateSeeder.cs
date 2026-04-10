using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed CurrencyRate
    public class CurrencyRateSeeder : IEntitySeeder
    {
        private readonly TaifDbContext _context;

        public CurrencyRateSeeder(TaifDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            if (_context.CurrencyRates.Any())
            {
                Console.WriteLine("CurrencyRateSeeder: rates already exist, skipping.");
                return;
            }

            var now = DateTime.UtcNow;
            var rates = new List<CurrencyRate>
            {
                new() { Id = Guid.NewGuid(), CurrencyCode = "USD", RateToUsd = 1.0m,  LastUpdatedAt = now },
                new() { Id = Guid.NewGuid(), CurrencyCode = "EUR", RateToUsd = 0.92m, LastUpdatedAt = now },
                new() { Id = Guid.NewGuid(), CurrencyCode = "GBP", RateToUsd = 0.79m, LastUpdatedAt = now },
                new() { Id = Guid.NewGuid(), CurrencyCode = "JOD", RateToUsd = 0.71m, LastUpdatedAt = now },
                new() { Id = Guid.NewGuid(), CurrencyCode = "SAR", RateToUsd = 3.75m, LastUpdatedAt = now },
                new() { Id = Guid.NewGuid(), CurrencyCode = "AED", RateToUsd = 3.67m, LastUpdatedAt = now },
            };

            _context.CurrencyRates.AddRange(rates);
            await _context.SaveChangesAsync();
            Console.WriteLine($"CurrencyRateSeeder: seeded {rates.Count} currency rates.");
        }
    }
}
