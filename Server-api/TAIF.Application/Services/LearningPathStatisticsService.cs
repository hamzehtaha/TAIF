using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LearningPathStatisticsService : ILearningPathStatisticsService
    {
        private readonly ILearningPathRepository _learningPathRepository;
        private readonly IUserLearningPathProgressRepository _progressRepository;
        private readonly ILogger<LearningPathStatisticsService> _logger;

        public LearningPathStatisticsService(
            ILearningPathRepository learningPathRepository,
            IUserLearningPathProgressRepository progressRepository,
            ILogger<LearningPathStatisticsService> logger)
        {
            _learningPathRepository = learningPathRepository;
            _progressRepository = progressRepository;
            _logger = logger;
        }

        public async Task UpdateAllLearningPathStatisticsAsync()
        {
            _logger.LogInformation("Starting learning path statistics update for all learning paths");

            var learningPaths = await _learningPathRepository.GetAllAsync(withDeleted: false);

            if (learningPaths == null || !learningPaths.Any())
            {
                _logger.LogInformation("No learning paths found to update");
                return;
            }

            // Fetch enrollment counts and durations in bulk (single query each)
            var enrollmentCounts = await _progressRepository.GetEnrollmentCountsPerLearningPathAsync();
            var durations = await _learningPathRepository.GetAllLearningPathDurationsAsync();

            int updatedCount = 0;
            foreach (var learningPath in learningPaths)
            {
                var enrollmentCount = enrollmentCounts.GetValueOrDefault(learningPath.Id);
                var totalDuration = durations.GetValueOrDefault(learningPath.Id);

                if (learningPath.TotalEnrolled != enrollmentCount ||
                    Math.Abs(learningPath.DurationInSeconds - totalDuration) > 0.001)
                {
                    learningPath.TotalEnrolled = enrollmentCount;
                    learningPath.DurationInSeconds = totalDuration;

                    _learningPathRepository.Update(
                        learningPath,
                        lp => lp.TotalEnrolled,
                        lp => lp.DurationInSeconds);

                    updatedCount++;
                }
            }

            if (updatedCount > 0)
            {
                await _learningPathRepository.SaveChangesAsync();
            }

            _logger.LogInformation(
                "Successfully updated statistics for {UpdatedCount} out of {TotalCount} learning paths",
                updatedCount, learningPaths.Count);
        }

        public async Task<bool> UpdateLearningPathStatisticsAsync(Guid learningPathId)
        {
            _logger.LogInformation("Starting learning path statistics update for {LearningPathId}", learningPathId);

            var learningPath = await _learningPathRepository.GetByIdAsync(learningPathId, withDeleted: false);

            if (learningPath == null)
            {
                _logger.LogWarning("Learning path {LearningPathId} not found", learningPathId);
                return false;
            }

            var enrollments = await _progressRepository
                .FindNoTrackingAsync(p => p.LearningPathId == learningPathId);
            var enrollmentCount = enrollments.Count;

            var totalDuration = await CalculateTotalDurationAsync(learningPathId);

            learningPath.TotalEnrolled = enrollmentCount;
            learningPath.DurationInSeconds = totalDuration;

            _learningPathRepository.Update(
                learningPath,
                lp => lp.TotalEnrolled,
                lp => lp.DurationInSeconds);

            await _learningPathRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully updated learning path {LearningPathId}: {EnrollmentCount} enrollments, {Duration} seconds",
                learningPathId, enrollmentCount, totalDuration);

            return true;
        }

        private async Task<double> CalculateTotalDurationAsync(Guid learningPathId)
        {
            try
            {
                var learningPath = await _learningPathRepository.GetWithSectionsAndCoursesAsync(learningPathId);

                if (learningPath == null)
                {
                    _logger.LogWarning("Learning path {LearningPathId} not found during duration calculation", learningPathId);
                    return 0;
                }

                if (learningPath.Sections == null || !learningPath.Sections.Any())
                {
                    _logger.LogWarning("Learning path {LearningPathId} has no sections", learningPathId);
                    return 0;
                }

                var totalDuration = learningPath.Sections
                    .Where(s => s.Courses != null)
                    .SelectMany(s => s.Courses)
                    .Where(lpc => lpc.Course != null)
                    .Sum(lpc => lpc.Course.TotalDurationInSeconds);

                return totalDuration;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating duration for learning path {LearningPathId}", learningPathId);
                return 0;
            }
        }
    }
}