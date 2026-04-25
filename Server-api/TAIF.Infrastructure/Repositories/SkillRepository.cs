using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class SkillRepository : RepositoryBase<Skill>, ISkillRepository
    {
        private readonly TaifDbContext _context;
        public SkillRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<List<Skill>> GetByIdsGlobalAsync(IEnumerable<Guid> ids)
            => _context.Skills
                .IgnoreQueryFilters()
                .Where(s => !s.IsDeleted && ids.Contains(s.Id))
                .ToListAsync();
    }
}
