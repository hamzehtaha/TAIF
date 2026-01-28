using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemService : IService<LessonItem>
    {
        Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
    }
}
