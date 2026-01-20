using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ILessonItemRepository
    {
        Task<List<LessonItem>> GetAllAsync();
        Task<LessonItem?> GetByIdAsync(int id);
        Task<List<LessonItem>> GetByCourseIdAsync(int courseId);
        Task<LessonItem> CreateAsync(LessonItem lessonItem);
        Task<bool> UpdateAsync(LessonItem lessonItem);
        Task<bool> DeleteAsync(int id);
    }
}
