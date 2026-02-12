using Microsoft.EntityFrameworkCore;
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

        public async Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false)
        {
            return await FindNoTrackingAsync(((lesson) => lesson.CourseId.Equals(courseId)), withDeleted);
        }

        public async Task<Dictionary<Guid, double>> GetTotalDurationPerCourseAsync()
        {
            return await _context.lessons
                .Where(l => !l.IsDeleted)
                .Join(_context.LessonItems.Where(li => !li.IsDeleted),
                    lesson => lesson.Id,
                    lessonItem => lessonItem.LessonId,
                    (lesson, lessonItem) => new { lesson.CourseId, lessonItem.DurationInSeconds })
                .GroupBy(x => x.CourseId)
                .Select(g => new { CourseId = g.Key, TotalDuration = g.Sum(x => x.DurationInSeconds) })
                .ToDictionaryAsync(x => x.CourseId, x => x.TotalDuration);
        }
    }
}