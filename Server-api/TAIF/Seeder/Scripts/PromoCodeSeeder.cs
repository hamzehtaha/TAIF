using System.Text.Json;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed PromoCode
    public class PromoCodeSeeder : IEntitySeeder
    {
        // Test: demo promo codes for testing the subscription/checkout flow
        public SeedCategory Category => SeedCategory.Test;

        private readonly TaifDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PromoCodeSeeder(TaifDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedAsync()
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Seeder", "Data", "PromoCode.seed.json");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file not found: {filePath}");

            var json = await File.ReadAllTextAsync(filePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var codes = JsonSerializer.Deserialize<List<PromoCodeJson>>(json, options)
                ?? throw new InvalidOperationException("Invalid PromoCode JSON");

            foreach (var item in codes)
            {
                if (_context.PromoCodes.Any(p => p.Code == item.Code))
                    continue;

                _context.PromoCodes.Add(new PromoCode
                {
                    Code = item.Code,
                    Description = item.Description,
                    DiscountPercent = item.DiscountPercent,
                    MaxUses = item.MaxUses,
                    MaxUsesPerUser = item.MaxUsesPerUser,
                    ExpiresAt = item.ExpiresAt.HasValue
                        ? DateTime.UtcNow.AddDays(item.ExpiresAt.Value)
                        : null,
                    IsActive = item.IsActive,
                    ApplicablePlanIds = null  // valid for all plans
                });
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("✅ PromoCodes seeded successfully");
        }

        private class PromoCodeJson
        {
            public string Code { get; set; } = null!;
            public string? Description { get; set; }
            public decimal DiscountPercent { get; set; }
            public int? MaxUses { get; set; }
            public int? MaxUsesPerUser { get; set; }
            /// <summary>Days from now until expiry. null = never expires.</summary>
            public int? ExpiresAt { get; set; }
            public bool IsActive { get; set; } = true;
        }
    }
}
