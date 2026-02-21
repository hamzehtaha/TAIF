using Microsoft.Extensions.Logging;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class UserLearningPathProgressService : ServiceBase<UserLearningPathProgress>, IUserLearningPathProgressService
    {
        private readonly IUserLearningPathProgressRepository _progressRepository;
        private readonly ILearningPathRepository _learningPathRepository;
        private readonly IEnrollmentService _enrollmentService;
        private readonly ILessonItemProgressService _lessonItemProgressService;
        private readonly ILogger<UserLearningPathProgressService> _logger;

        public UserLearningPathProgressService(
            IUserLearningPathProgressRepository repository,
            ILearningPathRepository learningPathRepository,
            IEnrollmentService enrollmentService,
            ILessonItemProgressService lessonItemProgressService,
            ILogger<UserLearningPathProgressService> logger) : base(repository)
        {
            _progressRepository = repository;
            _learningPathRepository = learningPathRepository;
            _enrollmentService = enrollmentService;
            _lessonItemProgressService = lessonItemProgressService;
            _logger = logger;
        }

        public async Task<List<LearningPathResponseDTO>> GetUserEnrolledLearningPathsAsync(Guid userId)
        {
            var userProgress = await _progressRepository.GetUserLearningPathsWithDetailsAsync(userId);

            return userProgress.Select(up => new LearningPathResponseDTO
            {
                Id = up.LearningPath.Id,
                Name = up.LearningPath.Name,
                Description = up.LearningPath.Description,
                Photo = up.LearningPath.Photo,
                TotalEnrolled = up.LearningPath.TotalEnrolled,
                DurationInSeconds = up.LearningPath.DurationInSeconds,
                TotalSections = up.LearningPath.Sections?.Count ?? 0,
                TotalCourses = up.LearningPath.Sections?.Sum(s => s.Courses?.Count ?? 0) ?? 0,
                CreatedAt = up.LearningPath.CreatedAt,
                IsEnrolled = true
            }).ToList();
        }

        public async Task<LearningPathProgressResponseDTO?> GetLearningPathWithProgressAsync(
            Guid learningPathId,
            Guid userId)
        {
            var progress = await _progressRepository.GetUserProgressAsync(userId, learningPathId);
            if (progress == null)
                return null;

            // Check and auto-complete if eligible (before returning response)
            await CheckAndAutoCompleteAsync(progress, userId, learningPathId);

            var lp = progress.LearningPath;

            var completedDuration = await CalculateUserCompletedDurationAsync(userId, learningPathId);

            var userCourses = await _enrollmentService.GetUserCoursesAsync(userId);
            var enrolledCourseIds = new HashSet<Guid>(userCourses.Select(c => c.Id));

            return new LearningPathProgressResponseDTO
            {
                Id = lp.Id,
                Name = lp.Name,
                Description = lp.Description,
                Photo = lp.Photo,
                DurationInSeconds = lp.DurationInSeconds,
                CreatedAt = lp.CreatedAt,
                EnrolledAt = progress.EnrolledAt,
                CompletedDuration = completedDuration,
                CurrentSectionId = progress.CurrentSectionId,
                CurrentCourseId = progress.CurrentCourseId,
                IsCompleted = progress.IsCompleted,
                CompletedAt = progress.CompletedAt,
                Sections = lp.Sections.Select(s => new LearningPathSectionProgressDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Order = s.Order,
                    IsCurrentSection = s.Id == progress.CurrentSectionId,
                    Courses = s.Courses.Select(c => new LearningPathCourseProgressDTO
                    {
                        Id = c.Id,
                        Order = c.Order,
                        IsRequired = c.IsRequired,
                        CourseId = c.CourseId,
                        CourseName = c.Course.Name ?? string.Empty,
                        CourseDescription = c.Course.Description,
                        CoursePhoto = c.Course.Photo,
                        CourseDurationInSeconds = c.Course.TotalDurationInSeconds,
                        IsEnrolled = enrolledCourseIds.Contains(c.CourseId),
                        IsCurrentCourse = c.CourseId == progress.CurrentCourseId
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<EnrollmentStatusResponseDTO> GetEnrollmentStatusAsync(Guid userId, Guid learningPathId)
        {
            var progress = await _progressRepository.FindOneNoTrackingAsync(
                predicate: p => p.UserId == userId && p.LearningPathId == learningPathId,
                withDeleted: false
            );

            return new EnrollmentStatusResponseDTO
            {
                IsEnrolled = progress != null,
                EnrolledAt = progress?.EnrolledAt
            };
        }

        public async Task<UserLearningPathProgress> EnrollUserAsync(Guid userId, Guid learningPathId)
        {
            var existingProgress = await _progressRepository.FindOneNoTrackingAsync(
                predicate: p => p.UserId == userId && p.LearningPathId == learningPathId,
                withDeleted: false
            );

            if (existingProgress != null)
            {
                throw new InvalidOperationException("User is already enrolled in this learning path");
            }

            var learningPath = await _learningPathRepository.GetByIdAsync(learningPathId);
            if (learningPath == null)
            {
                throw new ArgumentException("Learning path not found", nameof(learningPathId));
            }

            var progress = new UserLearningPathProgress
            {
                UserId = userId,
                LearningPathId = learningPathId,
                EnrolledAt = DateTime.UtcNow,
                CompletedDuration = 0
            };

            await _progressRepository.AddAsync(progress);
            await _progressRepository.SaveChangesAsync();

            return progress;
        }

        public async Task<double> CalculateUserCompletedDurationAsync(Guid userId, Guid learningPathId)
        {
            var courseIds = await _learningPathRepository.GetCourseIdsInLearningPathAsync(learningPathId);

            double totalCompleted = 0;
            foreach (var courseId in courseIds)
            {
                var completed = await _lessonItemProgressService.GetUserCourseCompletedDurationAsync(userId, courseId);
                totalCompleted += completed;
            }

            return totalCompleted;
        }

        public async Task UpdateProgressAsync(Guid userId, Guid learningPathId)
        {
            var progress = await _progressRepository.FindOneAsync(
                predicate: p => p.UserId == userId && p.LearningPathId == learningPathId,
                withDeleted: false
            );

            if (progress == null)
                return;

            progress.CompletedDuration = await CalculateUserCompletedDurationAsync(userId, learningPathId);

            _progressRepository.Update(progress);
            await _progressRepository.SaveChangesAsync();
        }

        // Check and auto-complete learning path if all required courses are done
        private async Task CheckAndAutoCompleteAsync(
            UserLearningPathProgress progress,
            Guid userId,
            Guid learningPathId)
        {
            // Skip if already completed
            if (progress.IsCompleted)
            {
                _logger.LogDebug("Learning path {LearningPathId} already completed for user {UserId}",
                    learningPathId, userId);
                return;
            }

            _logger.LogDebug("Checking learning path {LearningPathId} completion eligibility for user {UserId}",
                learningPathId, userId);

            // Get all required course IDs in this learning path
            var requiredCourseIds = await _learningPathRepository
                .GetRequiredCourseIdsInLearningPathAsync(learningPathId);

            if (!requiredCourseIds.Any())
            {
                _logger.LogWarning("Learning path {LearningPathId} has no required courses",
                    learningPathId);
                return;
            }

            // Batch check: Are all required courses completed?
            var completionStatus = await _enrollmentService
                .CheckMultipleCourseCompletionsAsync(userId, requiredCourseIds);

            bool allRequiredCoursesComplete = requiredCourseIds.All(courseId =>
                completionStatus.GetValueOrDefault(courseId, false));

            if (allRequiredCoursesComplete)
            {
                _logger.LogInformation(
                    "Auto-completing learning path {LearningPathId} for user {UserId}. " +
                    "All {Count} required courses are complete.",
                    learningPathId, userId, requiredCourseIds.Count);

                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;

                _progressRepository.Update(progress);
                await _progressRepository.SaveChangesAsync();

                _logger.LogInformation("Learning path {LearningPathId} marked complete for user {UserId} at {CompletedAt}",
                    learningPathId, userId, progress.CompletedAt);
            }
            else
            {
                var completedCount = completionStatus.Count(kvp => kvp.Value);
                _logger.LogDebug(
                    "Learning path {LearningPathId} not yet complete for user {UserId}. " +
                    "{CompletedCount} of {TotalCount} required courses completed.",
                    learningPathId, userId, completedCount, requiredCourseIds.Count);
            }
        }
    }
}