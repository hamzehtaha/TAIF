using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IOrganizationService : IService<Organization>
    {
        Task<List<Organization>> GetAllPublicAsync();
    }
}