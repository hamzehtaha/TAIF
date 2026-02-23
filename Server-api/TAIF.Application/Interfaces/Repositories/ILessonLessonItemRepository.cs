using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface ILessonLessonItemRepository : IRepository<LessonLessonItem>
{
    Task<List<LessonLessonItem>> GetByLessonIdAsync(Guid lessonId);
    Task<List<LessonLessonItem>> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<LessonLessonItem?> GetByCompositeKeyAsync(Guid lessonId, Guid lessonItemId);
    Task<int> GetMaxOrderForLessonAsync(Guid lessonId);
}
