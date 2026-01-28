using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces.Repositories;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonRepository : RepositoryBase<Lesson>, ILessonRepository
    {
        private readonly TaifDbContext _context;

        public LessonRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false)
        {
            return await FindNoTrackingAsync(((lesson) => lesson.CourseId.Equals(courseId)), withDeleted);
        }
    }
}