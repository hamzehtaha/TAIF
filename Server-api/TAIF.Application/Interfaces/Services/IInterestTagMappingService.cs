using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IInterestTagMappingService : IService<InterestTagMapping>
    {
        Task<List<InterestTagMapping>> GetByInterestIdAsync(Guid interestId);
        Task<List<InterestTagMapping>> GetByTagIdAsync(Guid tagId);
    }
}
