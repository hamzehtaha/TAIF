using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class EnrollmentService : ServiceBase<Enrollment>, IEnrollmentService
    {
        private readonly IEnrollmentRepository _repo;
        public EnrollmentService(IEnrollmentRepository repository) : base(repository)
        {
            _repo = repository;
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

        public async Task UpdateLastLessonItemId(Guid userId, Guid courseId, Guid lessonItemId)
        {
            Enrollment enrollment = await _repo.FindOneAsync((x) => x.UserId.Equals(userId) && x.CourseId.Equals(courseId));
            enrollment.LastLessonItemId = lessonItemId;
            await _repo.SaveChangesAsync();
        }
    }
}
