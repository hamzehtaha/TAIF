using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories;

public class CourseLessonRepository : RepositoryBase<CourseLesson>, ICourseLessonRepository
{
    public CourseLessonRepository(TaifDbContext context) : base(context) { }

    public async Task<List<CourseLesson>> GetByCourseIdAsync(Guid courseId)
    {
        return await _dbSet
            .Where(cl => cl.CourseId == courseId && !cl.IsDeleted)
            .Include(cl => cl.Lesson)
            .OrderBy(cl => cl.Order)
            .ToListAsync();
    }

    public async Task<List<CourseLesson>> GetByLessonIdAsync(Guid lessonId)
    {
        return await _dbSet
            .Where(cl => cl.LessonId == lessonId && !cl.IsDeleted)
            .Include(cl => cl.Course)
            .ToListAsync();
    }

    public async Task<CourseLesson?> GetByCompositeKeyAsync(Guid courseId, Guid lessonId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(cl => cl.CourseId == courseId && cl.LessonId == lessonId && !cl.IsDeleted);
    }

    public async Task<int> GetMaxOrderForCourseAsync(Guid courseId)
    {
        var maxOrder = await _dbSet
            .Where(cl => cl.CourseId == courseId && !cl.IsDeleted)
            .MaxAsync(cl => (int?)cl.Order);
        return maxOrder ?? 0;
    }
}
