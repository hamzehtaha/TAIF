using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonService : IService<Lesson>
    {
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false);
    }
}
