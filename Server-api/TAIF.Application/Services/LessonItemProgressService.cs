using System.Text.Json;
using Microsoft.Extensions.Logging;
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
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly IQuizSubmissionService _quizSubmissionService;
        private readonly ILearningPathRepository _learningPathRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ILogger<LessonItemProgressService> _logger;

        public LessonItemProgressService(
            ILessonItemProgressRepository repository, 
            ILessonItemService lessonItemService,
            ILessonItemRepository lessonItemRepository,
            IQuizSubmissionService quizSubmissionService,
            ILearningPathRepository learningPathRepository,
            IEnrollmentRepository enrollmentRepository,
            ICourseRepository courseRepository,
            ILogger<LessonItemProgressService> logger) : base(repository)
        {
            _lessonItemProgressRepository = repository;
            _lessonItemService = lessonItemService;
            _lessonItemRepository = lessonItemRepository;
            _quizSubmissionService = quizSubmissionService;
            _learningPathRepository = learningPathRepository;
            _enrollmentRepository = enrollmentRepository;
            _courseRepository = courseRepository;
            _logger = logger;
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
            // Use the repository method that works with the M-M junction table
            var lessonItems = await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
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
                    IsCompleted = progressLookup.TryGetValue(li.Id, out var completed) && completed
                }).ToList();
            return lessonItemsResponse;
        }
        
        public async Task<LessonItemProgress> SetLessonItemAsCompleted(Guid UserId, SetLessonItemAsCompletedRequest dto)
        {
            _logger.LogInformation("Setting lesson item {LessonItemId} as completed for user {UserId}", 
                dto.LessonItemId, UserId);

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
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Lesson item {LessonItemId} marked as completed for user {UserId}", 
                dto.LessonItemId, UserId);

            try
            {
                await TryAutoCompleteCourseAsync(UserId, dto.CourseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during auto-completion check for course {CourseId}", dto.CourseId);
            }

            return lessonItemProgress;
        }

        private async Task TryAutoCompleteCourseAsync(Guid userId, Guid courseId)
        {
            _logger.LogDebug("Trying auto-completion for course {CourseId} and user {UserId}", 
                courseId, userId);

            var enrollment = await _enrollmentRepository.FindOneAsync(
                e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null || enrollment.IsCompleted)
            {
                _logger.LogDebug("Course {CourseId} already completed or no enrollment for user {UserId}", 
                    courseId, userId);
                return;
            }

            var course = await _courseRepository.GetByIdAsync(courseId);
            
            if (course == null || course.TotalLessonItems == 0)
            {
                _logger.LogDebug("Course {CourseId} not found or has no items", courseId);
                return;
            }

            bool isEligible = await _enrollmentRepository.HasUserCompletedAllLessonItemsAsync(
                userId, courseId, course.TotalLessonItems);

            if (isEligible)
            {
                enrollment.IsCompleted = true;
                enrollment.CompletedAt = DateTime.UtcNow;
                await _enrollmentRepository.SaveChangesAsync();

                _logger.LogInformation("Auto-completed course {CourseId} for user {UserId}", 
                    courseId, userId);
            }
        }

        /// <summary>
        /// Gets the total completed duration in seconds for a user's progress in a specific course
        /// </summary>
        public async Task<double> GetUserCourseCompletedDurationAsync(Guid userId, Guid courseId)
        {
            return await _lessonItemProgressRepository.GetCompletedDurationSumAsync(userId, courseId);
        }

        /// <summary>
        /// Gets the total completed duration in seconds for a user's progress in a learning path
        /// </summary>
        public async Task<double> GetUserCompletedDurationForLearningPathAsync(Guid userId, Guid learningPathId)
        {
            var courseIds = await _learningPathRepository.GetCourseIdsInLearningPathAsync(learningPathId);
            
            if (!courseIds.Any())
                return 0;

            // Single grouped query instead of N+1
            return await _lessonItemProgressRepository.GetCompletedDurationSumForCoursesAsync(userId, courseIds);
        }

        /// <summary>
        /// Gets count of completed lesson items for a user in a course
        /// </summary>
        public async Task<int> GetCompletedItemCountAsync(Guid userId, Guid courseId)
        {
            return await _lessonItemProgressRepository.GetCompletedItemCountAsync(userId, courseId);
        }
    }
}
