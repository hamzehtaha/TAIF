using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ILessonItemService : IService<LessonItem>
    {
        Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
    }
}
