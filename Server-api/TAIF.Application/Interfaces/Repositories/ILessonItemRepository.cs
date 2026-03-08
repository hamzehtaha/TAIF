using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILessonItemRepository : IRepository<LessonItem>
    {
        Task<List<(LessonItem Item, int Order)>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
        Task<List<LessonItem>> GetAllWithContentAsync(bool withDeleted = false);
        Task<LessonItem?> GetByIdWithContentAsync(Guid id);
        Task<List<LessonItem>> GetBySkillsAsync(List<Guid> skillIds);
    }
}