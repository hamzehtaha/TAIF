using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ILessonService : IService<Lesson>
    {
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false);
    }
}
