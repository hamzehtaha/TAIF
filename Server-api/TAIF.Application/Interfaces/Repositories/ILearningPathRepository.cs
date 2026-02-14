using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILearningPathRepository : IRepository<LearningPath>
    {
        Task<LearningPath?> GetWithSectionsAndCoursesAsync(Guid id, bool withDeleted = false);
        Task<List<Guid>> GetCourseIdsInLearningPathAsync(Guid learningPathId);
    }
}