using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemProgressService : IService<LessonItemProgress>
    {
        Task<QuizResultResponse> SubmitQuizAsync(Guid userId, SubmitQuizRequest request);
        Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid userId, Guid lessonId, bool withDeleted = false);
        Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto);
        Task<double> GetUserCourseCompletedDurationAsync(Guid userId, Guid courseId);
        Task<double> GetUserCompletedDurationForLearningPathAsync(Guid userId, Guid learningPathId);
        Task<int> GetCompletedItemCountAsync(Guid userId, Guid courseId);
    }
}
