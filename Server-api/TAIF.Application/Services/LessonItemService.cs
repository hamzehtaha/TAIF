using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonItemService : ServiceBase<LessonItem>, ILessonItemService
    {
        private readonly ILessonItemRepository _lessonItemRepository;

        public LessonItemService(ILessonItemRepository repository) : base(repository)
        {
            _lessonItemRepository = repository;
        }

        public async Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            return await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
        }
    }
}