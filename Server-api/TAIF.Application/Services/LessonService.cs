using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonService : ILessonRepository
    {
        private readonly ILessonRepository _repository;

        public LessonService(ILessonRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Lesson>> GetAllAsync() => _repository.GetAllAsync();
        public Task<Lesson?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);
        public Task<List<Lesson>> GetByCourseIdAsync(Guid courseId) => _repository.GetByCourseIdAsync(courseId);
        public Task<Lesson> CreateAsync(Lesson lesson) => _repository.CreateAsync(lesson);
        public Task<bool> UpdateAsync(Lesson lesson) => _repository.UpdateAsync(lesson);
        public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);
    }
}