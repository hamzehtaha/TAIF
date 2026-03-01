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

        public async Task<List<UserLearningPathProgress>> GetUserLearningPathsWithDetailsAsync(Guid userId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(ulpp => ulpp.UserId == userId && !ulpp.IsDeleted && !ulpp.LearningPath.IsDeleted)
                .Include(ulpp => ulpp.LearningPath)
                    .ThenInclude(lp => lp.Sections)
                        .ThenInclude(s => s.Courses)
                .ToListAsync();
        }

        public async Task<UserLearningPathProgress?> GetUserProgressWithDetailsAsync(Guid userId, Guid learningPathId)
        {
            var progress = await _dbSet
                .AsNoTracking()
                .Where(ulpp => ulpp.UserId == userId && ulpp.LearningPathId == learningPathId && !ulpp.IsDeleted)
                .Include(ulpp => ulpp.LearningPath)
                    .ThenInclude(lp => lp.Sections)
                        .ThenInclude(s => s.Courses)
                            .ThenInclude(c => c.Course)
                .FirstOrDefaultAsync();

            if (progress?.LearningPath != null)
            {
                // Order in memory
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
            var query = _dbSet
                .AsNoTracking()
                .Where(ulpp => ulpp.UserId == userId && !ulpp.LearningPath.IsDeleted);

            if (!withDeleted)
                query = query.Where(ulpp => !ulpp.IsDeleted);

            return await query
                .Include(ulpp => ulpp.LearningPath)
                .ToListAsync();
        }

        public async Task<UserLearningPathProgress?> GetUserProgressAsync(Guid userId, Guid learningPathId, bool withDeleted = false)
        {
            var query = _dbSet
                .AsNoTracking()
                .Where(ulpp => ulpp.UserId == userId && ulpp.LearningPathId == learningPathId);

            if (!withDeleted)
                query = query.Where(ulpp => !ulpp.IsDeleted);

            var progress = await query
                .Include(ulpp => ulpp.LearningPath)
                    .ThenInclude(lp => lp.Sections)
                        .ThenInclude(s => s.Courses)
                            .ThenInclude(c => c.Course)
                .FirstOrDefaultAsync();
            
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

        public async Task<Dictionary<Guid, int>> GetEnrollmentCountsPerLearningPathAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Where(ulpp => !ulpp.IsDeleted)
                .GroupBy(ulpp => ulpp.LearningPathId)
                .Select(g => new { LearningPathId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.LearningPathId, x => x.Count);
        }
    }
}