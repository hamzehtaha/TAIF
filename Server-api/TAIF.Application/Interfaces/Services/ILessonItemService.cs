using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemService : IService<LessonItem>
    {
        Task<List<LessonItemResponse>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
        Task<LessonItem?> GetByIdWithContentAsync(Guid id);
    }
}
