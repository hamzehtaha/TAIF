using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Requests;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILessonItemProgressService : IService<LessonItemProgress>
    {
        public Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto);
        Task<QuizResultResponse> SubmitQuizAsync(Guid userId, SubmitQuizRequest request);
        Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid UserId, Guid lessonId, bool withDeleted = false);

    }
}
