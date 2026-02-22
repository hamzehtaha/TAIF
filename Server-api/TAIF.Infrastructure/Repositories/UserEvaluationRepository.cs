using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class UserEvaluationRepository
        : RepositoryBase<UserEvaluation>, IUserEvaluationRepository
    {
        private readonly TaifDbContext _context;

        public UserEvaluationRepository(TaifDbContext context)
            : base(context)
        {
            _context = context;
        }

        public async Task<bool> ExistsForUserAsync(Guid userId, bool withDeleted = false)
        {
            return await AnyAsync(e => e.UserId == userId, withDeleted);
        }

        public async Task<UserEvaluation?> GetByUserIdAsync(Guid userId, bool withDeleted = false)
        {
            return await FindOneAsync(e => e.UserId == userId, withDeleted);
        }
    }
}
