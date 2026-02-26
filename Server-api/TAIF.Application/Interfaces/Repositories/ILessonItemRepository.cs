using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonItemRepository : IRepository<LessonItem>
    {
        Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
        Task<List<LessonItem>> GetAllWithContentAsync(bool withDeleted = false);
        Task<LessonItem?> GetByIdWithContentAsync(Guid id);
    }
}