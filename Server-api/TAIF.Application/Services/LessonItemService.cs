using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LessonItemService : ServiceBase<LessonItem>, ILessonItemService
    {
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly ILessonItemProgressRepository _lessonItemProgressRepository;
        public LessonItemService(ILessonItemRepository repository, ILessonItemProgressRepository lessonItemProgressRepository) : base(repository)
        {
            _lessonItemRepository = repository;
            _lessonItemProgressRepository = lessonItemProgressRepository;
        }
        public async Task<List<LessonItem>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            return await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
        }
        public async Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid userId , Guid lessonId, bool withDeleted = false)
        {
            List<LessonItem> lessonItems = await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            List<Guid> lessonItemIds = lessonItems.Select((lessonItem) => lessonItem.Id).ToList();
            List<LessonItemProgress> lessonItemProgress = await _lessonItemProgressRepository.FindAsync((x) => x.UserId.Equals(userId) && lessonItemIds.Contains(x.LessonItemId));
            var progressLookup = lessonItemProgress.ToDictionary(x => x.LessonItemId, x => x.IsCompleted);
            List<LessonItemResponse> lessonItemsResponse = lessonItems
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    //URL = li.URL,
                    Content = li.Content,
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                    Order = li.Order,
                    IsCompleted = progressLookup.TryGetValue(li.Id, out var completed) && completed
                }).ToList();
            return lessonItemsResponse;
        }


    }
}