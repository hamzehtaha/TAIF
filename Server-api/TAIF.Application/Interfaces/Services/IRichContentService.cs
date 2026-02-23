using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface IRichContentService : IService<RichContent>
{
    Task<RichContent?> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<RichContent> CreateAndAssignToLessonItemAsync(RichContent richContent, Guid lessonItemId);
}
