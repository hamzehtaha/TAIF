using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LearningPathRepository : RepositoryBase<LearningPath>, ILearningPathRepository
    {
        private readonly TaifDbContext _taifContext;

        public LearningPathRepository(TaifDbContext context) : base(context)
        {
            _taifContext = context;
        }

        public async Task<List<LearningPath>> GetAllWithSectionsAndCoursesAsync(bool withDeleted = false)
        {
            IQueryable<LearningPath> query = _dbSet
                .AsNoTracking()
                .Include(lp => lp.Sections)
                    .ThenInclude(s => s.Courses)
                        .ThenInclude(c => c.Course);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            var learningPaths = await query.ToListAsync();

            // Order in memory after loading
            foreach (var lp in learningPaths)
            {
                lp.Sections = lp.Sections.OrderBy(s => s.Order).ToList();
                foreach (var section in lp.Sections)
                {
                    section.Courses = section.Courses.OrderBy(c => c.Order).ToList();
                }
            }

            return learningPaths;
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

        public async Task<Dictionary<Guid, double>> GetAllLearningPathDurationsAsync()
        {
            return await _taifContext.LearningPathCourses
                .AsNoTracking()
                .Where(lpc => !lpc.IsDeleted && !lpc.Course.IsDeleted)
                .GroupBy(lpc => lpc.Section.LearningPathId)
                .Select(g => new
                {
                    LearningPathId = g.Key,
                    TotalDuration = g.Sum(lpc => lpc.Course.TotalDurationInSeconds)
                })
                .ToDictionaryAsync(x => x.LearningPathId, x => x.TotalDuration);
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