using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class UserSubscriptionRepository : RepositoryBase<UserSubscription>, IUserSubscriptionRepository
    {
        private readonly TaifDbContext _context;

        public UserSubscriptionRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<UserSubscription>> GetAllWithPlansAsync(SubscriptionStatus? status = null)
        {
            var query = _context.UserSubscriptions
                .Include(s => s.Plan)
                .Where(s => !s.IsDeleted);

            if (status.HasValue)
                query = query.Where(s => s.Status == status.Value);

            return await query.OrderByDescending(s => s.StartDate).ToListAsync();
        }

        public async Task<UserSubscription?> GetActiveByUserIdAsync(Guid userId)
        {
            var now = DateTime.UtcNow;

            return await _context.UserSubscriptions
                .Include(s => s.Plan)
                    .ThenInclude(p => p.Features)
                .Where(s => s.UserId == userId && !s.IsDeleted &&
                    (
                        s.Status == SubscriptionStatus.Active ||
                        s.Status == SubscriptionStatus.Trialing ||
                        s.Status == SubscriptionStatus.PastDue ||
                        (s.Status == SubscriptionStatus.Cancelled && s.EndDate.HasValue && s.EndDate.Value > now)
                    ))
                .OrderByDescending(s => s.StartDate)
                .FirstOrDefaultAsync();
        }

        public async Task<List<UserSubscription>> GetHistoryByUserIdAsync(Guid userId)
        {
            return await _context.UserSubscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId && !s.IsDeleted)
                .OrderByDescending(s => s.StartDate)
                .ToListAsync();
        }

        public async Task<List<UserSubscription>> GetExpiredAsync()
        {
            var now = DateTime.UtcNow;

            return await _context.UserSubscriptions
                .Include(s => s.Plan)
                .Include(s => s.User)
                .Where(s => !s.IsDeleted &&
                    (s.Status == SubscriptionStatus.Active ||
                     s.Status == SubscriptionStatus.Trialing ||
                     s.Status == SubscriptionStatus.Cancelled) &&
                    s.EndDate.HasValue && s.EndDate.Value <= now)
                .ToListAsync();
        }

        public async Task<List<UserSubscription>> GetExpiringWithinDaysAsync(int days)
        {
            var now = DateTime.UtcNow;
            var threshold = now.AddDays(days);

            return await _context.UserSubscriptions
                .Include(s => s.Plan)
                .Include(s => s.User)
                .Where(s => !s.IsDeleted &&
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate.HasValue &&
                    s.EndDate.Value > now &&
                    s.EndDate.Value <= threshold)
                .ToListAsync();
        }

        public async Task<bool> HasUsedTrialForPlanAsync(Guid userId, Guid planId)
        {
            return await _context.UserSubscriptions
                .AnyAsync(s => s.UserId == userId &&
                    s.PlanId == planId &&
                    s.TrialEndsAt.HasValue &&
                    !s.IsDeleted);
        }

        public async Task<UserSubscription?> GetWithDetailsAsync(Guid subscriptionId)
        {
            return await _context.UserSubscriptions
                .Include(s => s.User)
                .Include(s => s.Plan)
                    .ThenInclude(p => p.Features)
                .Include(s => s.Payments)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId && !s.IsDeleted);
        }

        public async Task<int> GetNewSubscriptionsCountAsync(DateTime from, DateTime to)
        {
            return await _context.UserSubscriptions
                .CountAsync(s => !s.IsDeleted && s.CreatedAt >= from && s.CreatedAt <= to);
        }

        public async Task<int> GetCancellationsCountAsync(DateTime from, DateTime to)
        {
            return await _context.UserSubscriptions
                .CountAsync(s => !s.IsDeleted &&
                    s.Status == SubscriptionStatus.Cancelled &&
                    s.CancelledAt.HasValue &&
                    s.CancelledAt.Value >= from &&
                    s.CancelledAt.Value <= to);
        }
    }
}
