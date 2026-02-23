using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories;

public class RichContentRepository : RepositoryBase<RichContent>, IRichContentRepository
{
    public RichContentRepository(TaifDbContext context) : base(context) { }

    public async Task<RichContent?> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(rc => rc.LessonItemId == lessonItemId && !rc.IsDeleted);
    }
}
