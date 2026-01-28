using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync(
                e => e.UserId == userId,
                includes: e => e.Course
            );
            return enrollments.Select(e => e.Course).ToList();
        }
        public async Task<List<User>> GetCourseUsersAsync(Guid courseId)
        {
            var enrollments = await _repo.FindWithIncludesNoTrackingAsync(
                e => e.CourseId == courseId,
                includes: e => e.User
            );
            return enrollments.Select(e => e.User).ToList();
        }
    }
}
