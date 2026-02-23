using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class RichContentService : ServiceBase<RichContent>, IRichContentService
{
    private readonly IRichContentRepository _richContentRepository;

    public RichContentService(IRichContentRepository repository) : base(repository)
    {
        _richContentRepository = repository;
    }

    public async Task<RichContent?> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _richContentRepository.GetByLessonItemIdAsync(lessonItemId);
    }

    public async Task<RichContent> CreateAndAssignToLessonItemAsync(RichContent richContent, Guid lessonItemId)
    {
        richContent.LessonItemId = lessonItemId;
        await _richContentRepository.AddAsync(richContent);
        await _richContentRepository.SaveChangesAsync();
        return richContent;
    }
}
