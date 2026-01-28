using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonRepository : IRepository<Lesson>
    {
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false);
    }
}
