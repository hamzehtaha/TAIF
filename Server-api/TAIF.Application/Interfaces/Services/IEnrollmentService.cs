using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IEnrollmentService : IService<Enrollment>
    {
        Task<Enrollment> GetEnrollmentDetails(Guid userId, Guid courseId);
        Task<EnrollmentDetailsResponse> GetEnrollmentDetailsWithProgressAsync(Guid userId, Guid courseId);
        Task<List<Course>> GetUserCoursesAsync(Guid userId);
        Task<List<User>> GetCourseUsersAsync(Guid courseId);
        Task<List<Course>> GetUserFavouriteCourses(Guid userId);
        Task<bool> ToggleCourseFavourite(Guid userId, Guid courseId);
        Task UpdateLastLessonItemId(Guid userId, Guid courseId, Guid lessonItemId);
    }
}
