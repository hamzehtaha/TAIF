using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces.Repositories;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonItemRepository : RepositoryBase<LessonItem>, ILessonItemRepository
    {
        private readonly TaifDbContext _context;

        public LessonItemRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            return await FindNoTrackingAsync(((lessonItem) => lessonItem.LessonId.Equals(lessonId)), withDeleted);
        }
    }
}