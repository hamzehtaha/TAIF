using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseStatisticsService : ICourseStatisticsService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILogger<CourseStatisticsService> _logger;

        public CourseStatisticsService(
            ICourseRepository courseRepository,
            IEnrollmentRepository enrollmentRepository,
            ILessonRepository lessonRepository,
            ILogger<CourseStatisticsService> logger)
        {
            _courseRepository = courseRepository;
            _enrollmentRepository = enrollmentRepository;
            _lessonRepository = lessonRepository;
            _logger = logger;
        }

        public async Task UpdateAllCourseStatisticsAsync()
        {
            _logger.LogInformation("Starting course statistics update for all courses");

            var courses = await _courseRepository.GetAllAsync(withDeleted: false);

            if (courses == null || !courses.Any())
            {
                _logger.LogInformation("No courses found to update");
                return;
            }

            // Database-side aggregation - no memory loading
            var enrollmentCounts = await _enrollmentRepository.GetEnrollmentCountsPerCourseAsync();
            var courseDurations = await _lessonRepository.GetTotalDurationPerCourseAsync();

            // Update each course
            int updatedCount = 0;
            foreach (var course in courses)
            {
                // Using GetValueOrDefault (1 lookup instead of 2)
                var enrollmentCount = enrollmentCounts.GetValueOrDefault(course.Id);
                var totalDuration = courseDurations.GetValueOrDefault(course.Id);

                if (course.TotalEnrolled != enrollmentCount || 
                    Math.Abs(course.TotalDurationInSeconds - totalDuration) > 0.001)
                {
                    course.TotalEnrolled = enrollmentCount;
                    course.TotalDurationInSeconds = totalDuration;

                    _courseRepository.Update(
                        course,
                        c => c.TotalEnrolled,
                        c => c.TotalDurationInSeconds);
                    
                    updatedCount++;
                }
            }

            if (updatedCount > 0)
            {
                await _courseRepository.SaveChangesAsync();
            }

            _logger.LogInformation(
                "Successfully updated statistics for {UpdatedCount} out of {TotalCount} courses",
                updatedCount, courses.Count);
        }

        public async Task<bool> UpdateCourseStatisticsAsync(Guid courseId)
        {
            _logger.LogInformation("Starting course statistics update for course {CourseId}", courseId);

            var course = await _courseRepository.GetByIdAsync(courseId, withDeleted: false);

            if (course == null)
            {
                _logger.LogWarning("Course {CourseId} not found", courseId);
                return false;
            }

            // Calculate enrollment count
            var enrollments = await _enrollmentRepository
                .FindNoTrackingAsync(e => e.CourseId == courseId);
            var enrollmentCount = enrollments.Count;

            // Calculate total duration
            var allDurations = await _lessonRepository.GetTotalDurationPerCourseAsync();
            var totalDuration = allDurations.GetValueOrDefault(courseId);

            // Update course statistics
            course.TotalEnrolled = enrollmentCount;
            course.TotalDurationInSeconds = totalDuration;

            _courseRepository.Update(
                course,
                c => c.TotalEnrolled,
                c => c.TotalDurationInSeconds);

            await _courseRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully updated course {CourseId}: {EnrollmentCount} enrollments, {Duration} seconds",
                courseId, enrollmentCount, totalDuration);

            return true;
        }
    }
}