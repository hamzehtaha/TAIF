using System.Linq.Expressions;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseService : ServiceBase<Course> , ICourseService
    {
        public CourseService(ICourseRepository repository):base(repository)
        {
            
        }
    }
}