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

            var enrollmentCounts = await _progressRepository.GetEnrollmentCountsPerLearningPathAsync();

            int updatedCount = 0;
            foreach (var learningPath in learningPaths)
            {
                var enrollmentCount = enrollmentCounts.GetValueOrDefault(learningPath.Id);
                var totalDuration = await CalculateTotalDurationAsync(learningPath.Id);

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
            var learningPath = await _learningPathRepository.GetWithSectionsAndCoursesAsync(learningPathId);

            if (learningPath == null)
                return 0;

            return learningPath.Sections
                .SelectMany(s => s.Courses)
                .Sum(lpc => lpc.Course.TotalDurationInSeconds);
        }
    }
}