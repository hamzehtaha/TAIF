using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ILessonRepository
    {
        Task<List<Lesson>> GetAllAsync();
        Task<Lesson?> GetByIdAsync(Guid id);
        Task<List<Lesson>> GetByCourseIdAsync(Guid courseId);
        Task<Lesson> CreateAsync(Lesson lesson);
        Task<bool> UpdateAsync(Lesson lesson);
        Task<bool> DeleteAsync(Guid id);
    }
}
