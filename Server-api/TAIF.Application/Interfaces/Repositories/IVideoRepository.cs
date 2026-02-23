using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface IVideoRepository : IRepository<Video>
{
    Task<Video?> GetByLessonItemIdAsync(Guid lessonItemId);
}
