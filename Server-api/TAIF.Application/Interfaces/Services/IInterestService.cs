using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IInterestService : IService<Interest>
    {
        Task<bool> InterestsValidationGuard(List<Guid> interests);
        Task<List<Interest>> GetUserInterestsAsync(Guid userId);
    }
}
