using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces.Repositories;

namespace TAIF.Infrastructure.Repositories
{
    public class CourseRepository : RepositoryBase<Course>, ICourseRepository
    {
        private readonly TaifDbContext _context;

        public CourseRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Course>> GetByCategoryIdAsync(Guid categoryId, bool withDeleted = false)
        {
            return await FindNoTrackingAsync(((course) => course.CategoryId.Equals(categoryId)), withDeleted);
        }

        public async Task<List<Course>> GetByUserIdAsync(Guid userId)
        {
            return await FindNoTrackingAsync(course => course.CreatedBy == userId);
        }

        public async Task<Course?> GetByIdWithCategoryAsync(Guid id, bool withDeleted = false)
        {
            var query = _context.Set<Course>()
                .Include(c => c.Category)
                .AsQueryable();
            
            if (!withDeleted)
                query = query.Where(c => !c.IsDeleted);
            return await query.FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}