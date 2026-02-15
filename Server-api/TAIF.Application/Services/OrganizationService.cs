using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class OrganizationService : ServiceBase<Organization>, IOrganizationService
    {
        private readonly IOrganizationRepository _repository;

        public OrganizationService(IOrganizationRepository repository) : base(repository)
        {
            _repository = repository;
        }

        public async Task<List<Organization>> GetAllPublicAsync()
        {
            return await _repository.FindNoTrackingAsync(
                predicate: o => o.Type == OrganizationType.Public && !o.IsDeleted,
                orderBy: o => o.Name,
                orderByDescending: false
            );
        }
    }
}