using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories;

public class QuestionRepository : RepositoryBase<Question>, IQuestionRepository
{
    public QuestionRepository(TaifDbContext context) : base(context) { }

    public async Task<List<Question>> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _dbSet
            .Where(q => q.LessonItemId == lessonItemId && !q.IsDeleted)
            .OrderBy(q => q.Order)
            .ToListAsync();
    }

    public async Task<int> GetMaxOrderForLessonItemAsync(Guid lessonItemId)
    {
        var maxOrder = await _dbSet
            .Where(q => q.LessonItemId == lessonItemId && !q.IsDeleted)
            .MaxAsync(q => (int?)q.Order);
        return maxOrder ?? 0;
    }
}
