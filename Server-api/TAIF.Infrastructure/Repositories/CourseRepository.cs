using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces;

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
    }
}