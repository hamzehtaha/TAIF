using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LearningPathCourseRepository : RepositoryBase<LearningPathCourse>, ILearningPathCourseRepository
    {
        public LearningPathCourseRepository(TaifDbContext context) : base(context)
        {
        }
    }
}