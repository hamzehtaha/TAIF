using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface IRichContentRepository : IRepository<RichContent>
{
    Task<RichContent?> GetByLessonItemIdAsync(Guid lessonItemId);
}
