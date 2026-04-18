using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.API.Seeder.Scripts
{
    // dotnet run -- seed SubscriptionPlan
    public class SubscriptionPlanSeeder : IEntitySeeder
    {
        // Production: plans must exist for users to subscribe
        public SeedCategory Category => SeedCategory.Production;

        private readonly TaifDbContext _context;

        public SubscriptionPlanSeeder(TaifDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            if (_context.SubscriptionPlans.Any())
            {
                Console.WriteLine("SubscriptionPlanSeeder: plans already exist, skipping.");
                return;
            }

            var plans = new List<SubscriptionPlan>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = "Free",
                    Description = "Access to free courses only. Great way to get started.",
                    MonthlyPrice = 0,
                    YearlyPrice = 0,
                    YearlyDiscountPercent = 0,
                    Currency = "USD",
                    IsActive = true,
                    IsPublic = true,
                    DisplayOrder = 0,
                    TrialDaysCount = 0,
                    Features = new List<SubscriptionPlanFeature>
                    {
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessPaidCourses,   Value = "false" },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessLearningPaths, Value = "false" },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.MaxVideoQuality,        Value = "480p"  },
                    }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = "Basic",
                    Description = "Full access to all courses and learning paths with a 30-day free trial.",
                    MonthlyPrice = 10.00m,
                    YearlyPrice = 84.00m,       // 30% off: $10 × 12 × 0.70 = $84
                    YearlyDiscountPercent = 30,
                    Currency = "USD",
                    IsActive = true,
                    IsPublic = true,
                    DisplayOrder = 1,
                    TrialDaysCount = 30,
                    Features = new List<SubscriptionPlanFeature>
                    {
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessPaidCourses,   Value = "true"  },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessLearningPaths, Value = "true"  },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.MaxVideoQuality,        Value = "1080p" },
                    }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = "Pro",
                    Description = "Advanced features for power users — everything in Basic plus priority support.",
                    MonthlyPrice = 25.00m,
                    YearlyPrice = 210.00m,      // 30% off: $25 × 12 × 0.70 = $210
                    YearlyDiscountPercent = 30,
                    Currency = "USD",
                    IsActive = false,       // not yet released
                    IsPublic = false,       // admin-assigned only until released
                    DisplayOrder = 2,
                    TrialDaysCount = 0,
                    Features = new List<SubscriptionPlanFeature>
                    {
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessPaidCourses,   Value = "true"  },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.CanAccessLearningPaths, Value = "true"  },
                        new() { Id = Guid.NewGuid(), FeatureKey = PlanFeatureKey.MaxVideoQuality,        Value = "1080p" },
                    }
                },
            };

            _context.SubscriptionPlans.AddRange(plans);
            await _context.SaveChangesAsync();
            Console.WriteLine($"SubscriptionPlanSeeder: seeded {plans.Count} plans (Free, Basic, Pro).");
        }
    }
}
