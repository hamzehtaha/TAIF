using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories;

public class VideoRepository : RepositoryBase<Video>, IVideoRepository
{
    public VideoRepository(TaifDbContext context) : base(context) { }

    public async Task<Video?> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(v => v.LessonItemId == lessonItemId && !v.IsDeleted);
    }
}
