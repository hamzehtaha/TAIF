using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IPromoCodeRepository : IRepository<PromoCode>
    {
        Task<PromoCode?> GetByCodeAsync(string code);
        Task<int> GetUserUsageCountAsync(Guid promoCodeId, Guid userId);
        Task AddUsageAsync(PromoCodeUsage usage);
        Task<List<PromoCode>> GetAllActiveAsync();
        Task<PromoCode?> GetByIdWithUsagesAsync(Guid id);
        Task<bool> CodeExistsAsync(string code);
    }
}
