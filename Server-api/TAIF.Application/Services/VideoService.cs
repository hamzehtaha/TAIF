using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class VideoService : ServiceBase<Video>, IVideoService
{
    private readonly IVideoRepository _videoRepository;

    public VideoService(IVideoRepository repository) : base(repository)
    {
        _videoRepository = repository;
    }

    public async Task<Video?> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _videoRepository.GetByLessonItemIdAsync(lessonItemId);
    }

    public async Task<Video> CreateAndAssignToLessonItemAsync(Video video, Guid lessonItemId)
    {
        video.LessonItemId = lessonItemId;
        await _videoRepository.AddAsync(video);
        await _videoRepository.SaveChangesAsync();
        return video;
    }
}
