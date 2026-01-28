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
        Task<List<Course>> GetUserCoursesAsync(Guid userId);
        Task<List<User>> GetCourseUsersAsync(Guid courseId);
    }
}
