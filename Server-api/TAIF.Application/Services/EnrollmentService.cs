using Microsoft.Extensions.Logging;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class EnrollmentService : ServiceBase<Enrollment>, IEnrollmentService
    {
        private readonly IEnrollmentRepository _repo;
        private readonly ILessonItemProgressService _lessonItemProgressService;
        private readonly ICourseRepository _courseRepository;
        private readonly ILogger<EnrollmentService> _logger;
        
        public EnrollmentService(
            IEnrollmentRepository repository, 
            ILessonItemProgressService lessonItemProgressService,
            ICourseRepository courseRepository,
            ILogger<EnrollmentService> logger) : base(repository)
        {
            _repo = repository;
            _lessonItemProgressService = lessonItemProgressService;
            _courseRepository = courseRepository;
            _logger = logger;
        }
        
        public async Task<List<Course>> GetUserCoursesAsync(Guid userId)
        {
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync(e => e.UserId == userId, includes: e => e.Course);
            return enrollments.Select(e => e.Course).ToList();
        }
        
        public async Task<List<User>> GetCourseUsersAsync(Guid courseId)
        {
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync(e => e.CourseId == courseId, includes: e => e.User);
            return enrollments.Select(e => e.User).ToList();
        }

        public async Task<List<Course>> GetUserFavouriteCourses(Guid userId)
        {
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync((e => e.UserId == userId && e.IsFavourite == true), includes: e => e.Course);
            return enrollments.Select(e => e.Course).ToList();
        }

        public async Task<bool> ToggleCourseFavourite(Guid userId, Guid courseId)
        {
            var enrollment = await _repo.FindOneAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            enrollment.IsFavourite = !enrollment.IsFavourite;
            int number_of_updated = await _repo.SaveChangesAsync();
            return number_of_updated > 0;
        }

        public async Task<Enrollment> GetEnrollmentDetails(Guid userId, Guid courseId)
        {
            var enrollment = await _repo.FindOneNoTrackingAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            return enrollment;
        }

        public async Task<EnrollmentDetailsResponse?> GetEnrollmentDetailsWithProgressAsync(Guid userId, Guid courseId)
        {
            var enrollment = await _repo.FindOneNoTrackingAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            
            if (enrollment == null)
            {
                return null;
            }

            var completedDuration = await _lessonItemProgressService.GetUserCourseCompletedDurationAsync(userId, courseId);
            
            return new EnrollmentDetailsResponse
            {
                Id = enrollment.Id,
                UserId = enrollment.UserId,
                CourseId = enrollment.CourseId,
                EnrolledAt = enrollment.EnrolledAt,
                IsFavourite = enrollment.IsFavourite,
                LastLessonItemId = enrollment.LastLessonItemId,
                CompletedDurationInSeconds = completedDuration,
                IsCompleted = enrollment.IsCompleted,
                CompletedAt = enrollment.CompletedAt
            };
        }

        public async Task UpdateLastLessonItemId(Guid userId, Guid courseId, Guid lessonItemId)
        {
            Enrollment enrollment = await _repo.FindOneAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            enrollment.LastLessonItemId = lessonItemId;
            await _repo.SaveChangesAsync();
        }

        public async Task<CourseCompletionEligibilityResponse> CheckCourseCompletionEligibilityAsync(
            Guid userId, 
            Guid courseId)
        {
            _logger.LogInformation("Checking course completion eligibility for user {UserId} and course {CourseId}", 
                userId, courseId);

            // Get course with cached TotalLessonItems
            var course = await _courseRepository.GetByIdAsync(courseId);
            
            if (course == null)
            {
                return new CourseCompletionEligibilityResponse
                {
                    IsEligible = false,
                    Message = "Course not found"
                };
            }

            if (course.TotalLessonItems == 0)
            {
                return new CourseCompletionEligibilityResponse
                {
                    IsEligible = false,
                    TotalItems = 0,
                    CompletedItems = 0,
                    CompletionPercentage = 0,
                    Message = "Course has no lesson items"
                };
            }

            // Efficient check using cached count (only 1 query!)
            bool allItemsCompleted = await _repo.HasUserCompletedAllLessonItemsAsync(
                userId, courseId, course.TotalLessonItems);

            // Get actual completed count for response details
            var completedCount = await _lessonItemProgressService.GetCompletedItemCountAsync(userId, courseId);

            return new CourseCompletionEligibilityResponse
            {
                IsEligible = allItemsCompleted,
                TotalItems = course.TotalLessonItems,
                CompletedItems = completedCount,
                CompletionPercentage = (double)completedCount / course.TotalLessonItems * 100,
                Message = allItemsCompleted 
                    ? "Ready to complete!" 
                    : $"Complete {course.TotalLessonItems - completedCount} more items"
            };
        }

        public async Task<bool> CompleteCourseAsync(Guid userId, Guid courseId)
        {
            _logger.LogInformation("Attempting to complete course {CourseId} for user {UserId}", 
                courseId, userId);

            // Get course with cached TotalLessonItems
            var course = await _courseRepository.GetByIdAsync(courseId);
            
            if (course == null)
                throw new InvalidOperationException("Course not found");

            // Check eligibility (efficient - uses cached count)
            bool isEligible = await _repo.HasUserCompletedAllLessonItemsAsync(
                userId, courseId, course.TotalLessonItems);
            
            if (!isEligible)
            {
                _logger.LogWarning("User {UserId} is not eligible to complete course {CourseId}", 
                    userId, courseId);
                throw new InvalidOperationException(
                    "Cannot complete course: not all lesson items are completed");
            }

            // Get enrollment
            var enrollment = await _repo.FindOneAsync(
                e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
                throw new InvalidOperationException("Enrollment not found");

            if (enrollment.IsCompleted)
                throw new InvalidOperationException("Course already completed");

            // Mark as completed
            enrollment.IsCompleted = true;
            enrollment.CompletedAt = DateTime.UtcNow;

            await _repo.SaveChangesAsync();

            _logger.LogInformation("Successfully completed course {CourseId} for user {UserId} at {CompletedAt}", 
                courseId, userId, enrollment.CompletedAt);

            return true;
        }

        public async Task TryAutoCompleteCourseAsync(Guid userId, Guid courseId)
        {
            _logger.LogDebug("Trying auto-completion for course {CourseId} and user {UserId}", 
                courseId, userId);

            var enrollment = await _repo.FindOneAsync(
                e => e.UserId == userId && e.CourseId == courseId);

            // Skip if no enrollment or already completed
            if (enrollment == null)
            {
                _logger.LogDebug("No enrollment found for user {UserId} in course {CourseId}", 
                    userId, courseId);
                return;
            }

            if (enrollment.IsCompleted)
            {
                _logger.LogDebug("Course {CourseId} already completed for user {UserId}", 
                    courseId, userId);
                return;
            }

            // Get course with cached TotalLessonItems
            var course = await _courseRepository.GetByIdAsync(courseId);
            
            if (course == null || course.TotalLessonItems == 0)
            {
                _logger.LogDebug("Course {CourseId} not found or has no items", courseId);
                return;
            }

            // Efficient check using cached count
            bool isEligible = await _repo.HasUserCompletedAllLessonItemsAsync(
                userId, courseId, course.TotalLessonItems);

            if (isEligible)
            {
                enrollment.IsCompleted = true;
                enrollment.CompletedAt = DateTime.UtcNow;
                await _repo.SaveChangesAsync();

                _logger.LogInformation("Auto-completed course {CourseId} for user {UserId}", 
                    courseId, userId);
            }
            else
            {
                _logger.LogDebug("Course {CourseId} not yet eligible for completion for user {UserId}", 
                    courseId, userId);
            }
        }

        public async Task<List<Course>> GetUserCompletedCoursesAsync(Guid userId)
        {
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync(
                e => e.UserId == userId && e.IsCompleted,
                includes: e => e.Course);
            
            return enrollments.Select(e => e.Course).ToList();
        }

        public async Task<Dictionary<Guid, bool>> CheckMultipleCourseCompletionsAsync(
            Guid userId, 
            List<Guid> courseIds)
        {
            if (!courseIds.Any())
                return new Dictionary<Guid, bool>();

            // Get courses with their TotalLessonItems
            var courses = await _courseRepository.FindNoTrackingAsync(c => courseIds.Contains(c.Id));
            var courseIdToTotalItems = courses.ToDictionary(c => c.Id, c => c.TotalLessonItems);

            // Batch check
            return await _repo.CheckMultipleCourseCompletionsAsync(userId, courseIdToTotalItems);
        }
    }
}
