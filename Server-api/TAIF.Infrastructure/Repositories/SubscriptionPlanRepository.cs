using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class SubscriptionPlanRepository : RepositoryBase<SubscriptionPlan>, ISubscriptionPlanRepository
    {
        private readonly TaifDbContext _context;

        public SubscriptionPlanRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<SubscriptionPlan?> GetWithFeaturesAsync(Guid id)
        {
            return await _context.SubscriptionPlans
                .Include(p => p.Features)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<List<SubscriptionPlan>> GetPublicPlansAsync()
        {
            return await _context.SubscriptionPlans
                .Include(p => p.Features)
                .Where(p => p.IsPublic && p.IsActive && !p.IsDeleted)
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();
        }

        public async Task<SubscriptionPlan?> GetFreePlanAsync()
        {
            return await _context.SubscriptionPlans
                .Include(p => p.Features)
                .Where(p => p.MonthlyPrice == 0 && p.IsActive && !p.IsDeleted)
                .OrderBy(p => p.DisplayOrder)
                .FirstOrDefaultAsync();
        }
    }
}
