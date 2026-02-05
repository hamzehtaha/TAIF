using System.Text.Json;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class LessonItemService : ServiceBase<LessonItem>, ILessonItemService
    {
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly ILessonItemProgressRepository _lessonItemProgressRepository;
        private readonly ILessonService _lessonService;
        private readonly ILessonItemProgressService _lessonItemProgressService;
        public LessonItemService(ILessonItemRepository repository, ILessonItemProgressRepository lessonItemProgressRepository, ILessonService lessonService, ILessonItemProgressService lessonItemProgressService) : base(repository)
        {
            _lessonItemRepository = repository;
            _lessonItemProgressRepository = lessonItemProgressRepository;
            _lessonService = lessonService;
            _lessonItemProgressService = lessonItemProgressService;
        }
        public async Task<List<LessonItemResponse>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            var lessonsItem =  await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            List<LessonItemResponse> lessonItemsResponse = lessonsItem
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    Content = SanitizeContent(li),
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                    Order = li.Order
                }).ToList();
            return lessonItemsResponse;
        }
        public async Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid userId , Guid lessonId, bool withDeleted = false)
        {
            List<LessonItem> lessonItems = await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            List<Guid> lessonItemIds = lessonItems.Select((lessonItem) => lessonItem.Id).ToList();
            List<LessonItemProgress> lessonItemProgress = await _lessonItemProgressRepository.FindAsync((x) => x.UserId.Equals(userId) && lessonItemIds.Contains(x.LessonItemId));
            var progressLookup = lessonItemProgress.ToDictionary(x => x.LessonItemId, x => x.IsCompleted);
            List<LessonItemResponse> lessonItemsResponse = lessonItems
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    Content = SanitizeContent(li),
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                    Order = li.Order,
                    IsCompleted = progressLookup.TryGetValue(li.Id, out var completed) && completed
                }).ToList();
            return lessonItemsResponse;
        }
        public async Task<QuizResultResponse> SubmitQuizAsync(Guid userId,SubmitQuizRequest request)
        {
            var lessonItem = await _lessonItemRepository.GetByIdAsync(request.LessonItemId);
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
            SetLessonItemAsCompletedRequest setLessonItemAsCompletedRequest = new SetLessonItemAsCompletedRequest();
            setLessonItemAsCompletedRequest.LessonItemId = request.LessonItemId;
            var lesson = await _lessonService.GetByIdAsync(lessonItem.LessonId);
            if (lesson is null)
            {
                throw new Exception("Error while getting lesson in SubmitQuizAsync");
            }
            setLessonItemAsCompletedRequest.CourseId = lesson.CourseId;
            var result = await _lessonItemProgressService.SetLessonItemAsCompleted(userId, setLessonItemAsCompletedRequest);
            if (result is null)
            {
                throw new Exception("Error while SetLessonItemAsCompleted in SubmitQuizAsync");
            }
            return new QuizResultResponse
            {
                Results = results,
                Score = score
            };
        }
        private object SanitizeContent(LessonItem item)
        {
            if (item.Type != LessonItemType.Question)
            {
                return JsonSerializer.Deserialize<object>(item.Content)!;
            }
            using var doc = JsonDocument.Parse(item.Content);
            var root = doc.RootElement;

            var sanitizedQuestions = root
                .GetProperty("questions")
                .EnumerateArray()
                .Select(q => new
                {
                    id = q.GetProperty("id").GetString(),
                    text = q.GetProperty("text").GetString(),
                    options = q.GetProperty("options")
                               .EnumerateArray()
                               .Select(o => o.GetString())
                               .ToList()
                })
                .ToList();

            return new
            {
                questions = sanitizedQuestions
            };
        }

    }

}