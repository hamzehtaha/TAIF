using TAIF.Application.DTOs;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemService : IService<LessonItem>
    {
        Task<List<LessonItemResponse>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false);
        Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid UserId, Guid lessonId, bool withDeleted = false);
        Task<QuizResultResponse> SubmitQuizAsync(Guid userId, SubmitQuizRequest request);
    }
}
