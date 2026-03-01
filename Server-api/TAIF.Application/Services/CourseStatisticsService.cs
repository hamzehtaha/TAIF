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

            var enrollmentCounts = await _enrollmentRepository.GetEnrollmentCountsPerCourseAsync();
            
            var courseStatistics = await _lessonRepository.GetCourseStatisticsAsync();
            
            var lessonCounts = await _lessonRepository.GetLessonCountPerCourseAsync();

            int updatedCount = 0;
            foreach (var course in courses)
            {
                var enrollmentCount = enrollmentCounts.GetValueOrDefault(course.Id);
                var stats = courseStatistics.GetValueOrDefault(course.Id);
                var lessonCount = lessonCounts.GetValueOrDefault(course.Id);

                // Extract values with null-safe access
                var totalDuration = stats?.TotalDuration ?? 0;
                var totalLessonItems = stats?.TotalLessonItems ?? 0;

                if (course.TotalEnrolled != enrollmentCount || 
                    Math.Abs(course.TotalDurationInSeconds - totalDuration) > 0.001 ||
                    course.TotalLessonItems != totalLessonItems ||
                    course.TotalLessons != lessonCount)
                {
                    course.TotalEnrolled = enrollmentCount;
                    course.TotalDurationInSeconds = totalDuration;
                    course.TotalLessonItems = totalLessonItems;
                    course.TotalLessons = lessonCount;

                    _courseRepository.Update(
                        course,
                        c => c.TotalEnrolled,
                        c => c.TotalDurationInSeconds,
                        c => c.TotalLessonItems,
                        c => c.TotalLessons);
                    
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

            var stats = await _lessonRepository.GetCourseStatisticsForSingleCourseAsync(courseId);

            var enrollments = await _enrollmentRepository
                .FindNoTrackingAsync(e => e.CourseId == courseId);
            var enrollmentCount = enrollments.Count;
            
            var lessonCounts = await _lessonRepository.GetLessonCountPerCourseAsync();
            var lessonCount = lessonCounts.GetValueOrDefault(courseId);

            course.TotalEnrolled = enrollmentCount;
            course.TotalDurationInSeconds = stats?.TotalDuration ?? 0;
            course.TotalLessonItems = stats?.TotalLessonItems ?? 0;
            course.TotalLessons = lessonCount;

            _courseRepository.Update(
                course,
                c => c.TotalEnrolled,
                c => c.TotalDurationInSeconds,
                c => c.TotalLessonItems,
                c => c.TotalLessons);

            await _courseRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully updated course {CourseId}: {EnrollmentCount} enrollments, {Duration} seconds, {ItemCount} items, {LessonCount} lessons",
                courseId, enrollmentCount, stats?.TotalDuration ?? 0, stats?.TotalLessonItems ?? 0, lessonCount);

            return true;
        }
    }
}