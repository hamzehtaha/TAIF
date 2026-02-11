using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemProgressService : IService<LessonItemProgress>
    {
        Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto);
        Task<QuizResultResponse> SubmitQuizAsync(Guid userId, SubmitQuizRequest request);
        Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid UserId, Guid lessonId, bool withDeleted = false);
        Task<double> GetUserCourseCompletedDurationAsync(Guid userId, Guid courseId);
    }
}
