using Microsoft.EntityFrameworkCore;
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

        /// <summary>
        /// Gets lesson items assigned to a lesson via the LessonLessonItem junction table
        /// </summary>
        public async Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            var query = _context.LessonLessonItems
                .Where(lli => lli.LessonId == lessonId && !lli.IsDeleted)
                .Include(lli => lli.LessonItem)
                    .ThenInclude(li => li.Content)
                .OrderBy(lli => lli.Order)
                .Select(lli => lli.LessonItem);

            if (!withDeleted)
                query = query.Where(li => !li.IsDeleted);

            return await query.ToListAsync();
        }

        public async Task<List<LessonItem>> GetAllWithContentAsync(bool withDeleted = false)
        {
            var query = _context.Set<LessonItem>()
                .Include(li => li.Content)
                .AsQueryable();

            if (!withDeleted)
                query = query.Where(li => !li.IsDeleted);

            return await query.OrderByDescending(li => li.CreatedAt).ToListAsync();
        }

        public async Task<LessonItem?> GetByIdWithContentAsync(Guid id)
        {
            return await _context.Set<LessonItem>()
                .Include(li => li.Content)
                .FirstOrDefaultAsync(li => li.Id == id && !li.IsDeleted);
        }
    }
}