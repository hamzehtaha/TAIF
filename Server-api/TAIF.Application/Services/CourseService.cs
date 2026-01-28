using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseService : ServiceBase<Course> , ICourseService
    {
        private readonly ICourseRepository _courseRepository;

        public CourseService(ICourseRepository repository):base(repository)
        {
            _courseRepository = repository;
        }

        public async Task<List<Course>> GetByCategoryIdAsync(Guid categoryId)
        {
            return await _courseRepository.GetByCategoryIdAsync(categoryId);
        }
    }
}