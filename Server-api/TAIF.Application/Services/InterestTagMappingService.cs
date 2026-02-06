using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class InterestTagMappingService : ServiceBase<InterestTagMapping>, IInterestTagMappingService
    {
        private readonly IInterestTagMappingRepository _mappingRepository;

        public InterestTagMappingService(IInterestTagMappingRepository repository) : base(repository)
        {
            _mappingRepository = repository;
        }

        public async Task<List<InterestTagMapping>> GetByInterestIdAsync(Guid interestId)
        {
            return await _mappingRepository.FindNoTrackingAsync((x)=>x.InterestId == interestId);
        }

        public async Task<List<InterestTagMapping>> GetByTagIdAsync(Guid tagId)
        {
            return await _mappingRepository.FindNoTrackingAsync((x) => x.TagId == tagId);
        }
    }
}
