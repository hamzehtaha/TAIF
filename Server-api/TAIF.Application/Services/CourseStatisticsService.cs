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
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly ILogger<CourseStatisticsService> _logger;

        public CourseStatisticsService(
            ICourseRepository courseRepository,
            IEnrollmentRepository enrollmentRepository,
            ILessonRepository lessonRepository,
            ILessonItemRepository lessonItemRepository,
            ILogger<CourseStatisticsService> logger)
        {
            _courseRepository = courseRepository;
            _enrollmentRepository = enrollmentRepository;
            _lessonRepository = lessonRepository;
            _lessonItemRepository = lessonItemRepository;
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

            // Calculate enrollment counts
            var enrollments = await _enrollmentRepository.GetAllNoTrackingAsync(withDeleted: false);
            var enrollmentCounts = enrollments
                .GroupBy(e => e.CourseId)
                .ToDictionary(g => g.Key, g => g.Count());

            // Calculate total duration
            var lessons = await _lessonRepository.GetAllNoTrackingAsync(withDeleted: false);
            var lessonsByCourse = lessons
                .GroupBy(l => l.CourseId)
                .ToDictionary(g => g.Key, g => g.Select(l => l.Id).ToList());

            var allLessonItems = await _lessonItemRepository.GetAllNoTrackingAsync(withDeleted: false);
            var courseDurations = new Dictionary<Guid, double>();

            foreach (var kvp in lessonsByCourse)
            {
                var courseId = kvp.Key;
                var lessonIds = kvp.Value;
                var totalDuration = allLessonItems
                    .Where(li => lessonIds.Contains(li.LessonId))
                    .Sum(li => li.DurationInSeconds);
                courseDurations[courseId] = totalDuration;
            }

            // Update each course
            int updatedCount = 0;
            foreach (var course in courses)
            {
                var enrollmentCount = enrollmentCounts.ContainsKey(course.Id)
                    ? enrollmentCounts[course.Id]
                    : 0;

                var totalDuration = courseDurations.ContainsKey(course.Id)
                    ? courseDurations[course.Id]
                    : 0;

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

        public async Task UpdateCourseStatisticsAsync(Guid courseId)
        {
            _logger.LogInformation("Starting course statistics update for course {CourseId}", courseId);

            var course = await _courseRepository.GetByIdAsync(courseId, withDeleted: false);

            if (course == null)
            {
                throw new InvalidOperationException($"Course with ID {courseId} not found");
            }

            // Calculate enrollment count
            var enrollments = await _enrollmentRepository
                .FindNoTrackingAsync(e => e.CourseId == courseId);
            var enrollmentCount = enrollments.Count;

            // Calculate total duration
            var lessons = await _lessonRepository
                .FindNoTrackingAsync(l => l.CourseId == courseId);
            var lessonIds = lessons.Select(l => l.Id).ToList();

            var lessonItems = await _lessonItemRepository
                .FindNoTrackingAsync(li => lessonIds.Contains(li.LessonId));
            var totalDuration = lessonItems.Sum(li => li.DurationInSeconds);

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
        }
    }
}