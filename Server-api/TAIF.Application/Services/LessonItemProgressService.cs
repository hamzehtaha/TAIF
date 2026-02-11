using System.Text.Json;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Payloads;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class LessonItemProgressService : ServiceBase<LessonItemProgress>, ILessonItemProgressService
    {
        private readonly ILessonItemProgressRepository _lessonItemProgressRepository;
        private readonly ILessonItemService _lessonItemService;
        private readonly IEnrollmentService _enrollmentService;
        private readonly IQuizSubmissionService _quizSubmissionService;

        public LessonItemProgressService(ILessonItemProgressRepository repository, ILessonService lessonService, ILessonItemService lessonItemService, IEnrollmentService enrollmentService, IQuizSubmissionService quizSubmissionService) : base(repository)
        {
            _lessonItemProgressRepository = repository;
            _lessonItemService = lessonItemService;
            _enrollmentService = enrollmentService;
            _quizSubmissionService = quizSubmissionService;
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

            var results = new List<QuestionAnswersResponse>();
            var answerPayloads = new List<QuizAnswerPayload>();
            int correctCount = 0;

            foreach (var answer in request.Answers)
            {
                if (!questions.TryGetValue(answer.QuestionId, out var question))
                    continue;

                bool isCorrect = question.CorrectIndex == answer.AnswerIndex;
                if (isCorrect) correctCount++;

                results.Add(new QuestionAnswersResponse
                {
                    QuestionId = answer.QuestionId,
                    IsCorrect = isCorrect
                });
                answerPayloads.Add(new QuizAnswerPayload
                {
                    QuestionId = answer.QuestionId,
                    SelectedAnswerIndex = answer.AnswerIndex,
                    CorrectAnswerIndex = question.CorrectIndex,
                    IsCorrect = isCorrect
                });
            }

            int score = (int)Math.Round((double)correctCount / questions.Count * 100);

            var answersJson = JsonSerializer.Serialize(answerPayloads);

            var userAnswer = await _quizSubmissionService.GetUserSubmissionAsync(userId, request.LessonItemId);
            if (userAnswer is null)
            {
                await _quizSubmissionService.CreateAsync(new QuizSubmission
                {
                    UserId = userId,
                    LessonItemId = request.LessonItemId,
                    AnswersJson = answersJson,
                    Score = score,
                    TotalQuestions = questions.Count,
                    CorrectAnswers = correctCount
                });
            }
            else
            {
                await _quizSubmissionService.UpdateAsync(userAnswer.Id, new QuizSubmission
                {
                    UserId = userId,
                    LessonItemId = request.LessonItemId,
                    AnswersJson = answersJson,
                    Score = score,
                    TotalQuestions = questions.Count,
                    CorrectAnswers = correctCount
                });
            }
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
                CompletedDurationInSeconds = lessonItem.DurationInSeconds
            };
            await _lessonItemProgressRepository.AddAsync(lessonItemProgress);
            await _enrollmentService.UpdateLastLessonItemId(UserId, dto.CourseId, dto.LessonItemId);
            await _repository.SaveChangesAsync();
            return lessonItemProgress;
        }

        /// <summary>
        /// Gets the total completed duration in seconds for a user's progress in a specific course
        /// </summary>
        public async Task<double> GetUserCourseCompletedDurationAsync(Guid userId, Guid courseId)
        {
            return await _lessonItemProgressRepository.SumCompletedDurationAsync(userId, courseId);
        }
    }
}
