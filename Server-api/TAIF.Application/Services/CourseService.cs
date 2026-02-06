using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseService : ServiceBase<Course> , ICourseService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IRecommendationService _recommendationService;

        public CourseService(ICourseRepository repository, IRecommendationService recommendationService) : base(repository)
        {
            _courseRepository = repository;
            _recommendationService = recommendationService;
        }

        public async Task<List<Course>> GetByCategoryIdAsync(Guid categoryId)
        {
            return await _courseRepository.GetByCategoryIdAsync(categoryId);
        }

        public async Task<List<Course>> GetRecommendedCoursesAsync(Guid userId, int limit = 10)
        {
            return await _recommendationService.GetRecommendedCoursesAsync(userId, limit);
        }
    }
}