using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class InstructorProfileRepository : RepositoryBase<InstructorProfile>, IInstructorProfileRepository
    {
        public InstructorProfileRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<InstructorProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(ip => ip.UserId == userId && !ip.IsDeleted);
        }

        public async Task<InstructorProfile?> GetByUserIdWithUserAsync(Guid userId)
        {
            return await _dbSet
                .Include(ip => ip.User)
                .Include(ip => ip.Organization)
                .FirstOrDefaultAsync(ip => ip.UserId == userId && !ip.IsDeleted);
        }
    }
}