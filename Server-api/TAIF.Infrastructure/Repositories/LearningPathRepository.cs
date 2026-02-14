using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LearningPathRepository : RepositoryBase<LearningPath>, ILearningPathRepository
    {
        public LearningPathRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<LearningPath?> GetWithSectionsAndCoursesAsync(Guid id, bool withDeleted = false)
        {
            IQueryable<LearningPath> query = _dbSet
                .AsNoTracking()
                .Include(lp => lp.Sections)
                    .ThenInclude(s => s.Courses)
                        .ThenInclude(c => c.Course);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            var learningPath = await query.FirstOrDefaultAsync(lp => lp.Id == id);

            // Order in memory after loading
            if (learningPath != null)
            {
                learningPath.Sections = learningPath.Sections.OrderBy(s => s.Order).ToList();
                foreach (var section in learningPath.Sections)
                {
                    section.Courses = section.Courses.OrderBy(c => c.Order).ToList();
                }
            }

            return learningPath;
        }

        public async Task<List<Guid>> GetCourseIdsInLearningPathAsync(Guid learningPathId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(lp => lp.Id == learningPathId && !lp.IsDeleted)
                .SelectMany(lp => lp.Sections)
                .SelectMany(s => s.Courses)
                .Select(lpc => lpc.CourseId)
                .Distinct()
                .ToListAsync();
        }
    }
}