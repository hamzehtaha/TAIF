using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class PromoCodeRepository : RepositoryBase<PromoCode>, IPromoCodeRepository
    {
        private readonly TaifDbContext _context;

        public PromoCodeRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PromoCode?> GetByCodeAsync(string code)
        {
            var normalizedCode = code.ToUpperInvariant();
            return await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == normalizedCode && !p.IsDeleted);
        }

        public async Task<int> GetUserUsageCountAsync(Guid promoCodeId, Guid userId)
        {
            return await _context.PromoCodeUsages
                .CountAsync(u => u.PromoCodeId == promoCodeId && u.UserId == userId);
        }

        public async Task AddUsageAsync(PromoCodeUsage usage)
        {
            usage.UsedAt = DateTime.UtcNow;
            await _context.PromoCodeUsages.AddAsync(usage);
        }

        public async Task<List<PromoCode>> GetAllActiveAsync()
        {
            return await _context.PromoCodes
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<PromoCode?> GetByIdWithUsagesAsync(Guid id)
        {
            return await _context.PromoCodes
                .Include(p => p.Usages)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<bool> CodeExistsAsync(string code)
        {
            var normalizedCode = code.ToUpperInvariant();
            return await _context.PromoCodes
                .AnyAsync(p => p.Code == normalizedCode && !p.IsDeleted);
        }
    }
}
