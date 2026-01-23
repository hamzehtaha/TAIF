using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ILessonItemRepository
    {
        Task<List<LessonItem>> GetAllAsync();
        Task<LessonItem?> GetByIdAsync(Guid id);
        Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId);
        Task<LessonItem> CreateAsync(LessonItem lessonItem);
        Task<bool> UpdateAsync(LessonItem lessonItem);
        Task<bool> DeleteAsync(Guid id);
    }
}