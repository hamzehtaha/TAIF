using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class LessonLessonItemService : ServiceBase<LessonLessonItem>, ILessonLessonItemService
{
    private readonly ILessonLessonItemRepository _lessonLessonItemRepository;

    public LessonLessonItemService(ILessonLessonItemRepository repository) : base(repository)
    {
        _lessonLessonItemRepository = repository;
    }

    public async Task<List<LessonLessonItem>> GetByLessonIdAsync(Guid lessonId)
    {
        return await _lessonLessonItemRepository.GetByLessonIdAsync(lessonId);
    }

    public async Task<List<LessonLessonItem>> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _lessonLessonItemRepository.GetByLessonItemIdAsync(lessonItemId);
    }

    public async Task<LessonLessonItem> AssignLessonItemToLessonAsync(Guid lessonId, Guid lessonItemId, int? order = null)
    {
        // Check if already assigned
        var existing = await _lessonLessonItemRepository.GetByCompositeKeyAsync(lessonId, lessonItemId);
        if (existing != null)
            throw new InvalidOperationException("LessonItem is already assigned to this lesson");

        // Get max order if not provided
        var assignedOrder = order ?? (await _lessonLessonItemRepository.GetMaxOrderForLessonAsync(lessonId)) + 1;

        var lessonLessonItem = new LessonLessonItem
        {
            LessonId = lessonId,
            LessonItemId = lessonItemId,
            Order = assignedOrder
        };

        await _lessonLessonItemRepository.AddAsync(lessonLessonItem);
        await _lessonLessonItemRepository.SaveChangesAsync();

        return lessonLessonItem;
    }

    public async Task<bool> UnassignLessonItemFromLessonAsync(Guid lessonId, Guid lessonItemId)
    {
        var lessonLessonItem = await _lessonLessonItemRepository.GetByCompositeKeyAsync(lessonId, lessonItemId);
        if (lessonLessonItem == null)
            return false;

        _lessonLessonItemRepository.SoftDelete(lessonLessonItem);
        await _lessonLessonItemRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateOrderAsync(Guid lessonId, Guid lessonItemId, int newOrder)
    {
        var lessonLessonItem = await _lessonLessonItemRepository.GetByCompositeKeyAsync(lessonId, lessonItemId);
        if (lessonLessonItem == null)
            return false;

        lessonLessonItem.Order = newOrder;
        _lessonLessonItemRepository.Update(lessonLessonItem, lli => lli.Order);
        await _lessonLessonItemRepository.SaveChangesAsync();
        return true;
    }
}
