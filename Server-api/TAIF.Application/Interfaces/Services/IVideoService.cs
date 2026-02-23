using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface IVideoService : IService<Video>
{
    Task<Video?> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<Video> CreateAndAssignToLessonItemAsync(Video video, Guid lessonItemId);
}
