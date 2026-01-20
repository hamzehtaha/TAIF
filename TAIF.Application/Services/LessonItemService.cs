using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonItemService : ILessonItemRepository
    {
        private readonly ILessonItemRepository _repository;

        public LessonItemService(ILessonItemRepository repository)
        {
            _repository = repository;
        }

        public Task<List<LessonItem>> GetAllAsync() => _repository.GetAllAsync();
        public Task<LessonItem?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<List<LessonItem>> GetByCourseIdAsync(int courseId) => _repository.GetByCourseIdAsync(courseId);
        public Task<LessonItem> CreateAsync(LessonItem lessonItem) => _repository.CreateAsync(lessonItem);
        public Task<bool> UpdateAsync(LessonItem lessonItem) => _repository.UpdateAsync(lessonItem);
        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}