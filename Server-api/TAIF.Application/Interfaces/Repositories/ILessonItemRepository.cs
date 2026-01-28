using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonItemRepository : IRepository<LessonItem>
    {
        Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
    }
}