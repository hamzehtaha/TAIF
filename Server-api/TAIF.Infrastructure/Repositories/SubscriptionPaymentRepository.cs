using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class SubscriptionPaymentRepository : RepositoryBase<SubscriptionPayment>, ISubscriptionPaymentRepository
    {
        private readonly TaifDbContext _context;

        public SubscriptionPaymentRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<SubscriptionPayment>> GetBySubscriptionIdAsync(Guid subscriptionId)
        {
            return await _context.SubscriptionPayments
                .Where(p => p.UserSubscriptionId == subscriptionId && !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _context.SubscriptionPayments
                .Where(p => p.Status == PaymentStatus.Completed && !p.IsDeleted)
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetRevenueForPeriodAsync(DateTime from, DateTime to)
        {
            return await _context.SubscriptionPayments
                .Where(p => p.Status == PaymentStatus.Completed && !p.IsDeleted &&
                    p.PaidAt.HasValue && p.PaidAt.Value >= from && p.PaidAt.Value <= to)
                .SumAsync(p => p.Amount);
        }
    }
}
