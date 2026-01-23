using TAIF.Application.DTOs;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseService : ICourseRepository
    {
        private readonly ICourseRepository _repository;

        public CourseService(ICourseRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Course>> GetAllAsync() => _repository.GetAllAsync();

        public Task<Course?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

        public Task<Course> CreateAsync(Course course) => _repository.CreateAsync(course);

        public Task<bool> UpdateAsync(Course course) => _repository.UpdateAsync(course);

        public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);
    }
}