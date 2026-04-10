using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ISubscriptionPaymentRepository : IRepository<SubscriptionPayment>
    {
        Task<List<SubscriptionPayment>> GetBySubscriptionIdAsync(Guid subscriptionId);

        /// <summary>Returns the SUM of all completed payment amounts (executed in the database).</summary>
        Task<decimal> GetTotalRevenueAsync();

        /// <summary>Returns the SUM of completed payment amounts within the given period.</summary>
        Task<decimal> GetRevenueForPeriodAsync(DateTime from, DateTime to);
    }
}
