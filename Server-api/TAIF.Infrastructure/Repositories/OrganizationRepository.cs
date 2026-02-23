using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class OrganizationRepository : RepositoryBase<Organization>, IOrganizationRepository
    {
        public OrganizationRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<Organization?> GetPublicOrganizationAsync()
        {
            return await _dbSet
                .FirstOrDefaultAsync(o => o.Identity == "default" && !o.IsDeleted && o.IsActive);
        }

        public async Task<Organization?> GetBySlugAsync(string slug)
        {
            return await _dbSet
                .FirstOrDefaultAsync(o => o.Slug == slug && !o.IsDeleted);
        }

        public async Task<bool> PublicOrganizationExistsAsync()
        {
            return await _dbSet
                .AnyAsync(o => o.Identity == "default" && !o.IsDeleted);
        }
    }
}