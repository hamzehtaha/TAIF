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
        
        public EnrollmentService(IEnrollmentRepository repository, ILessonItemProgressService lessonItemProgressService) : base(repository)
        {
            _repo = repository;
            _lessonItemProgressService = lessonItemProgressService;
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
        public async Task<EnrollmentDetailsResponse> GetEnrollmentDetailsWithProgressAsync(Guid userId, Guid courseId)
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
                CompletedDurationInSeconds = completedDuration
            };
        }

        public async Task UpdateLastLessonItemId(Guid userId, Guid courseId, Guid lessonItemId)
        {
            Enrollment enrollment = await _repo.FindOneAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            enrollment.LastLessonItemId = lessonItemId;
            await _repo.SaveChangesAsync();
        }
    }
}
