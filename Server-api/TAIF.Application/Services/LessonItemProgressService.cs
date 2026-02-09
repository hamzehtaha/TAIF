using System.Text.Json;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class LessonItemProgressService : ServiceBase<LessonItemProgress>, ILessonItemProgressService
    {
        private readonly ILessonItemProgressRepository _lessonItemProgressRepository;
        private readonly ILessonService _lessonService;
        private readonly ILessonItemService _lessonItemService;
        private readonly IEnrollmentService _enrollmentService;

        public LessonItemProgressService(ILessonItemProgressRepository repository, ILessonService lessonService, ILessonItemService lessonItemService, IEnrollmentService enrollmentService) : base(repository)
        {
            _lessonItemProgressRepository = repository;
            _lessonService = lessonService;
            _lessonItemService = lessonItemService;
            _enrollmentService = enrollmentService;
        }
        public async Task<QuizResultResponse> SubmitQuizAsync(Guid userId, SubmitQuizRequest request)
        {
            var lessonItem = await _lessonItemService.GetByIdAsync(request.LessonItemId);
            if (lessonItem == null || lessonItem.Type != LessonItemType.Question)
            {
                throw new Exception("Lesson item type is not question");
            }
            using var doc = JsonDocument.Parse(lessonItem.Content);

            var questions = doc.RootElement
                .GetProperty("questions")
                .EnumerateArray()
                .Select(q => new
                {
                    Id = q.GetProperty("id").GetString()!,
                    CorrectIndex = q.GetProperty("correctIndex").GetInt32()
                })
                .ToDictionary(q => q.Id);

            var results = new List<QuestionResult>();
            int correctCount = 0;

            foreach (var answer in request.Answers)
            {
                if (!questions.TryGetValue(answer.QuestionId, out var question))
                    continue;

                bool isCorrect = question.CorrectIndex == answer.AnswerIndex;
                if (isCorrect) correctCount++;

                results.Add(new QuestionResult
                {
                    QuestionId = answer.QuestionId,
                    IsCorrect = isCorrect
                });
            }

            int score = (int)Math.Round((double)correctCount / questions.Count * 100);
            return new QuizResultResponse
            {
                Results = results,
                Score = score
            };
        }
        public async Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid userId, Guid lessonId, bool withDeleted = false)
        {
            var lessonItems = await _lessonItemService.FindNoTrackingAsync((x) => x.LessonId.Equals(lessonId) && (withDeleted || !x.IsDeleted));
            List<LessonItemProgress> lessonItemProgress = await _lessonItemProgressRepository.FindAsync((x) => x.UserId.Equals(userId) && x.LessonID.Equals(lessonId));
            var progressLookup = lessonItemProgress.ToDictionary(x => x.LessonItemId, x => x.IsCompleted);
            List<LessonItemResponse> lessonItemsResponse = lessonItems
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    Content = LessonItemService.SanitizeContent(li),
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                    Order = li.Order,
                    IsCompleted = progressLookup.TryGetValue(li.Id, out var completed) && completed
                }).ToList();
            return lessonItemsResponse;
        }
        public async Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto)
        {
            var lessonItem = await _lessonItemService.GetByIdAsync(dto.LessonItemId);
            if (lessonItem is null)
            {
                throw new Exception("Lesson item not found");
            }

            LessonItemProgress lessonItemProgress = new LessonItemProgress
            {
                UserId = UserId,
                LessonItemId = dto.LessonItemId,
                CourseID = dto.CourseId,
                LessonID = dto.LessonID,
                IsCompleted = true,
                CompletedDuraionInSeconds = lessonItem.DurationInSeconds
            };
            await _lessonItemProgressRepository.AddAsync(lessonItemProgress);
            await _enrollmentService.UpdateLastLessonItemId(UserId, dto.CourseId, dto.LessonItemId);
            await _repository.SaveChangesAsync();
            return lessonItemProgress;
        }
    }
}
