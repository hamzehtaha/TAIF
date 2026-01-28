using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonService : ServiceBase<Lesson>, ILessonService
    {
        private readonly ILessonRepository _lessonRepository;

        public LessonService(ILessonRepository repository) : base(repository)
        {
            _lessonRepository = repository;
        }

        public async Task<List<Lesson>> GetByCourseIdAsync(Guid courseId, bool withDeleted = false)
        {
            return await _lessonRepository.GetByCourseIdAsync(courseId, withDeleted);
        }
    }
}