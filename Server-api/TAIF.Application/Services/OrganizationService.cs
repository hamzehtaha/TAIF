using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class OrganizationService : ServiceBase<Organization>, IOrganizationService
    {
        public OrganizationService(IOrganizationRepository repository) : base(repository)
        {
        }
    }
}