using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LearningPathCourseService : ServiceBase<LearningPathCourse>, ILearningPathCourseService
    {
        public LearningPathCourseService(ILearningPathCourseRepository repository) : base(repository)
        {
        }
    }
}