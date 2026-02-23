using Microsoft.EntityFrameworkCore;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonRepository : RepositoryBase<Lesson>, ILessonRepository
    {
        private readonly TaifDbContext _context;

        public LessonRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets lessons assigned to a course via the CourseLesson junction table
        /// </summary>
        public async Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false)
        {
            var query = _context.CourseLessons
                .Where(cl => cl.CourseId == courseId && !cl.IsDeleted)
                .Include(cl => cl.Lesson)
                .OrderBy(cl => cl.Order)
                .Select(cl => cl.Lesson);

            if (!withDeleted)
                query = query.Where(l => !l.IsDeleted);

            return await query.ToListAsync();
        }

        /// <summary>
        /// Gets both total duration and lesson item count per course in a single query
        /// Uses the M-M junction tables (CourseLesson and LessonLessonItem)
        /// </summary>
        public async Task<Dictionary<Guid, CourseStatisticsDTO>> GetCourseStatisticsAsync()
        {
            // Join through junction tables: Course -> CourseLesson -> Lesson -> LessonLessonItem -> LessonItem
            return await _context.CourseLessons
                .Where(cl => !cl.IsDeleted)
                .Join(_context.LessonLessonItems.Where(lli => !lli.IsDeleted),
                    cl => cl.LessonId,
                    lli => lli.LessonId,
                    (cl, lli) => new { cl.CourseId, lli.LessonItemId })
                .Join(_context.LessonItems.Where(li => !li.IsDeleted),
                    x => x.LessonItemId,
                    li => li.Id,
                    (x, li) => new { x.CourseId, li.DurationInSeconds })
                .GroupBy(x => x.CourseId)
                .Select(g => new 
                { 
                    CourseId = g.Key, 
                    TotalDuration = g.Sum(x => x.DurationInSeconds),
                    TotalLessonItems = g.Count() 
                })
                .ToDictionaryAsync(
                    x => x.CourseId, 
                    x => new CourseStatisticsDTO 
                    { 
                        TotalDuration = x.TotalDuration,
                        TotalLessonItems = x.TotalLessonItems
                    });
        }

        public async Task<CourseStatisticsDTO?> GetCourseStatisticsForSingleCourseAsync(Guid courseId)
        {
            // Join through junction tables for single course
            var result = await _context.CourseLessons
                .Where(cl => !cl.IsDeleted && cl.CourseId == courseId)
                .Join(_context.LessonLessonItems.Where(lli => !lli.IsDeleted),
                    cl => cl.LessonId,
                    lli => lli.LessonId,
                    (cl, lli) => new { cl.CourseId, lli.LessonItemId })
                .Join(_context.LessonItems.Where(li => !li.IsDeleted),
                    x => x.LessonItemId,
                    li => li.Id,
                    (x, li) => new { x.CourseId, li.DurationInSeconds })
                .GroupBy(x => x.CourseId)
                .Select(g => new 
                { 
                    CourseId = g.Key, 
                    TotalDuration = g.Sum(x => x.DurationInSeconds),
                    TotalLessonItems = g.Count()
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return new CourseStatisticsDTO 
            { 
                TotalDuration = result.TotalDuration,
                TotalLessonItems = result.TotalLessonItems
            };
        }

        /// <summary>
        /// Get lesson count per course using the junction table
        /// </summary>
        public async Task<Dictionary<Guid, int>> GetLessonCountPerCourseAsync()
        {
            return await _context.CourseLessons
                .Where(cl => !cl.IsDeleted)
                .Join(_context.lessons.Where(l => !l.IsDeleted),
                    cl => cl.LessonId,
                    l => l.Id,
                    (cl, l) => cl.CourseId)
                .GroupBy(courseId => courseId)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }
    }
}