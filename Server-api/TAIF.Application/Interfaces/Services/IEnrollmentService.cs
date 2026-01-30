using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IEnrollmentService : IService<Enrollment>
    {
        Task<Enrollment> GetEnrollmentDetails(Guid userId, Guid courseId);
        Task<List<Course>> GetUserCoursesAsync(Guid userId);
        Task<List<User>> GetCourseUsersAsync(Guid courseId);
        Task<List<Course>> GetUserFavouriteCourses(Guid userId);
        Task<bool> ToggleCourseFavourite(Guid userId, Guid courseId);

        
    }
}
