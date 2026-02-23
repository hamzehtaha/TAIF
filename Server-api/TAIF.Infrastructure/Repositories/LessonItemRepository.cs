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
                .OrderBy(lli => lli.Order)
                .Select(lli => lli.LessonItem);

            if (!withDeleted)
                query = query.Where(li => !li.IsDeleted);

            return await query.ToListAsync();
        }
    }
}