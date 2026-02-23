using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories;

public class LessonLessonItemRepository : RepositoryBase<LessonLessonItem>, ILessonLessonItemRepository
{
    public LessonLessonItemRepository(TaifDbContext context) : base(context) { }

    public async Task<List<LessonLessonItem>> GetByLessonIdAsync(Guid lessonId)
    {
        return await _dbSet
            .Where(lli => lli.LessonId == lessonId && !lli.IsDeleted)
            .Include(lli => lli.LessonItem)
            .OrderBy(lli => lli.Order)
            .ToListAsync();
    }

    public async Task<List<LessonLessonItem>> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _dbSet
            .Where(lli => lli.LessonItemId == lessonItemId && !lli.IsDeleted)
            .Include(lli => lli.Lesson)
            .ToListAsync();
    }

    public async Task<LessonLessonItem?> GetByCompositeKeyAsync(Guid lessonId, Guid lessonItemId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(lli => lli.LessonId == lessonId && lli.LessonItemId == lessonItemId && !lli.IsDeleted);
    }

    public async Task<int> GetMaxOrderForLessonAsync(Guid lessonId)
    {
        var maxOrder = await _dbSet
            .Where(lli => lli.LessonId == lessonId && !lli.IsDeleted)
            .MaxAsync(lli => (int?)lli.Order);
        return maxOrder ?? 0;
    }
}
