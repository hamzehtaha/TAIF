using System.Text.Json;
using Microsoft.Extensions.Logging;
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
            // Get lesson item with content
            var lessonItem = await _lessonItemRepository.GetByIdWithContentAsync(request.LessonItemId);
            if (lessonItem == null || lessonItem.Type != LessonItemType.Quiz)
            {
                throw new Exception("Lesson item is not a quiz");
            }

            if (lessonItem.Content == null || string.IsNullOrEmpty(lessonItem.Content.ContentJson))
            {
                throw new Exception("Quiz has no content");
            }

            var quiz = JsonSerializer.Deserialize<Quiz>(lessonItem.Content.ContentJson);
            if (quiz == null || quiz.Questions == null || quiz.Questions.Count == 0)
            {
                throw new Exception("Invalid quiz structure");
            }

            // Validate and score answers
            var results = new List<QuestionAnswerResult>();
            var answerPayloads = new List<QuizAnswerPayload>();
            int correctCount = 0;

            foreach (var answer in request.Answers)
            {
                var question = quiz.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null)
                {
                    _logger.LogWarning("Question not found: {QuestionId}", answer.QuestionId);
                    continue;
                }

                bool isCorrect = answer.SelectedOptionId == question.CorrectAnswerId;
                if (isCorrect) correctCount++;

                results.Add(new QuestionAnswerResult
                {
                    QuestionId = answer.QuestionId,
                    IsCorrect = isCorrect,
                    Explanation = isCorrect ? null : question.Explanation
                });

                answerPayloads.Add(new QuizAnswerPayload
                {
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = answer.SelectedOptionId
                });
            }

            // Calculate score
            int score = quiz.Questions.Count > 0
                ? (int)Math.Round((double)correctCount / quiz.Questions.Count * 100)
                : 0;

            // Separate "all answered" from "passed"
            bool allAnswered = request.Answers.Count == quiz.Questions.Count;

            // A submission is "completed" only when it passes the minimum threshold
            // (default to 100 if no MinPassScore is defined on the quiz)
            bool isCompleted = allAnswered && score == 100;

            // Serialize answers
            var answersJson = JsonSerializer.Serialize(answerPayloads);

            // Check if user already has a submission
            var existingSubmission = await _quizSubmissionService.GetUserSubmissionAsync(userId, request.LessonItemId);

            QuizSubmission submission;
            if (existingSubmission != null)
            {
                // Update existing submission (overwrite)
                existingSubmission.AnswersJson = answersJson;
                existingSubmission.Score = score;
                existingSubmission.IsCompleted = isCompleted;
                submission = await _quizSubmissionService.UpdateAsync(existingSubmission.Id, existingSubmission);
            }
            else
            {
                // Create new submission
                submission = await _quizSubmissionService.CreateAsync(new QuizSubmission
                {
                    UserId = userId,
                    LessonItemId = request.LessonItemId,
                    AnswersJson = answersJson,
                    Score = score,
                    IsCompleted = isCompleted
                });
            }

            // Mark lesson item as completed if score is 100%
            if (score == 100 && isCompleted)
            {
                await SetLessonItemAsCompleted(userId, new SetLessonItemAsCompletedRequest
                {
                    LessonItemId = request.LessonItemId,
                    LessonID = request.LessonId, 
                    CourseId = request.CourseId 
                });
            }

            return new QuizResultResponse
            {
                SubmissionId = submission.Id,
                Results = results,
                Score = score,
                IsCompleted = isCompleted
            };
        }

        public async Task<List<LessonItemResponse>> GetLessonItemsProgressAsync(Guid userId, Guid lessonId, bool withDeleted = false)
        {
            var lessonItems = await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            var lessonItemIds = lessonItems.Select(li => li.Id).ToList();

            // Query by LessonItemId membership — works regardless of how LessonID was stored
            var lessonItemProgress = await _lessonItemProgressRepository.FindAsync(
                x => x.UserId == userId && lessonItemIds.Contains(x.LessonItemId));

            var progressLookup = lessonItemProgress.ToDictionary(x => x.LessonItemId, x => x.IsCompleted);

            return lessonItems.Select(li => new LessonItemResponse
            {
                Id = li.Id,
                Name = li.Name,
                Description = li.Description,
                ContentId = li.ContentId,
                Content = GetContentData(li.Content),
                Type = li.Type,
                DurationInSeconds = li.DurationInSeconds,
                IsCompleted = progressLookup.TryGetValue(li.Id, out var completed) && completed
            }).ToList();
        }

        public async Task<LessonItemProgress> SetLessonItemAsCompleted(Guid userId, SetLessonItemAsCompletedRequest dto)
        {
            _logger.LogInformation("Setting lesson item {LessonItemId} as completed for user {UserId}",
                dto.LessonItemId, userId);

            var lessonItem = await _lessonItemService.GetByIdAsync(dto.LessonItemId);
            if (lessonItem == null)
            {
                throw new Exception("Lesson item not found");
            }

            // Check if progress already exists
            var existingProgress = await _lessonItemProgressRepository.FindAsync(
                p => p.UserId == userId && p.LessonItemId == dto.LessonItemId
            );

            var progress = existingProgress.FirstOrDefault();

            if (progress != null)
            {
                // Update existing progress
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;
                progress.CompletedDurationInSeconds = lessonItem.DurationInSeconds;
                
                // Update LessonID and CourseID if provided and different from Empty
                if (dto.LessonID != Guid.Empty)
                {
                    progress.LessonID = dto.LessonID;
                }
                if (dto.CourseId != Guid.Empty)
                {
                    progress.CourseID = dto.CourseId;
                }
                
                await _lessonItemProgressRepository.SaveChangesAsync();
            }
            else
            {
                // Get lessonId - check if empty and try to get from lesson item
                Guid lessonId = dto.LessonID;
                if (lessonId == Guid.Empty)
                {
                    var firstRelation = lessonItem.LessonLessonItems?.FirstOrDefault();
                    if (firstRelation != null)
                    {
                        lessonId = firstRelation.LessonId;
                    }
                }

                // Get courseId
                Guid courseId = dto.CourseId;

                // Create new progress
                var newProgress = new LessonItemProgress
                {
                    UserId = userId,
                    LessonItemId = dto.LessonItemId,
                    LessonID = lessonId,
                    CourseID = courseId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow,
                    CompletedDurationInSeconds = lessonItem.DurationInSeconds
                };

                await _lessonItemProgressRepository.AddAsync(newProgress);
                await _repository.SaveChangesAsync();
                progress = newProgress;
            }

            _logger.LogInformation("Lesson item {LessonItemId} marked as completed for user {UserId}",
                dto.LessonItemId, userId);

            // Try auto-complete course if CourseId is provided
            if (dto.CourseId != Guid.Empty)
            {
                try
                {
                    await TryAutoCompleteCourseAsync(userId, dto.CourseId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during auto-completion check for course {CourseId}", dto.CourseId);
                }
            }

            return progress;
        }

        private async Task TryAutoCompleteCourseAsync(Guid userId, Guid courseId)
        {
            var enrollment = await _enrollmentRepository.FindOneAsync(
                e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null || enrollment.IsCompleted) return;

            var course = await _courseRepository.GetByIdAsync(courseId);
            if (course == null) return;

            // Get all LessonItem IDs for this course (via CourseLessons - LessonItems)
            var allItemIds = course.CourseLessons
                .SelectMany(cl => cl.Lesson?.LessonLessonItems ?? Enumerable.Empty<LessonLessonItem>())
                .Select(lli => lli.LessonItemId)
                .Distinct()
                .ToList();

            if (!allItemIds.Any()) return;

            var completedCount = await _lessonItemProgressRepository.GetCompletedItemCountAsync(userId, courseId);

            if (completedCount >= allItemIds.Count)
            {
                enrollment.IsCompleted = true;
                enrollment.CompletedAt = DateTime.UtcNow;
                await _enrollmentRepository.SaveChangesAsync();
                _logger.LogInformation("Course {CourseId} auto-completed for user {UserId}", courseId, userId);
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

        private object? GetContentData(Content? content)
        {
            if (content == null || string.IsNullOrEmpty(content.ContentJson))
                return null;

            try
            {
                return JsonSerializer.Deserialize<object>(content.ContentJson);
            }
            catch
            {
                return null;
            }
        }
    }
}
