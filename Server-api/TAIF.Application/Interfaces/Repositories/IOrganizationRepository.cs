using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IOrganizationRepository : IRepository<Organization>
    {
        Task<Organization?> GetPublicOrganizationAsync();
        Task<Organization?> GetBySlugAsync(string slug);
        Task<bool> PublicOrganizationExistsAsync();
    }
}