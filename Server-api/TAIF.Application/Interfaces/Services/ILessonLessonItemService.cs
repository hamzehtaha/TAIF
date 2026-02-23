using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface ILessonLessonItemService : IService<LessonLessonItem>
{
    Task<List<LessonLessonItem>> GetByLessonIdAsync(Guid lessonId);
    Task<List<LessonLessonItem>> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<LessonLessonItem> AssignLessonItemToLessonAsync(Guid lessonId, Guid lessonItemId, int? order = null);
    Task<bool> UnassignLessonItemFromLessonAsync(Guid lessonId, Guid lessonItemId);
    Task<bool> UpdateOrderAsync(Guid lessonId, Guid lessonItemId, int newOrder);
}
