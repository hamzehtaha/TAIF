using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class UserLearningPathProgressRepository : RepositoryBase<UserLearningPathProgress>, IUserLearningPathProgressRepository
    {
        public UserLearningPathProgressRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<UserLearningPathProgress?> GetUserProgressAsync(Guid userId, Guid learningPathId, bool withDeleted = false)
        {
            IQueryable<UserLearningPathProgress> query = _dbSet
                .AsNoTracking()
                .Include(ulpp => ulpp.LearningPath)
                    .ThenInclude(lp => lp.Sections)
                        .ThenInclude(s => s.Courses)
                            .ThenInclude(c => c.Course);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            var progress = await query
                .FirstOrDefaultAsync(ulpp => ulpp.UserId == userId && ulpp.LearningPathId == learningPathId);

            if (progress?.LearningPath != null)
            {
                progress.LearningPath.Sections = progress.LearningPath.Sections.OrderBy(s => s.Order).ToList();
                foreach (var section in progress.LearningPath.Sections)
                {
                    section.Courses = section.Courses.OrderBy(c => c.Order).ToList();
                }
            }

            return progress;
        }

        public async Task<List<UserLearningPathProgress>> GetUserLearningPathsAsync(Guid userId, bool withDeleted = false)
        {
            return await FindWithIncludesNoTrackingAsync(
                predicate: ulpp => ulpp.UserId == userId,
                withDeleted: withDeleted,
                orderBy: ulpp => ulpp.EnrolledAt,
                orderByDescending: true,
                includes: ulpp => ulpp.LearningPath
            );
        }

        public async Task<Dictionary<Guid, int>> GetEnrollmentCountsPerLearningPathAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .GroupBy(p => p.LearningPathId)
                .Select(g => new { LearningPathId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.LearningPathId, x => x.Count);
        }
    }
}