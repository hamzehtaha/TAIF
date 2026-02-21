using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface ILearningPathRepository : IRepository<LearningPath>
    {
        Task<List<LearningPath>> GetAllWithSectionsAndCoursesAsync(bool withDeleted = false);
        Task<LearningPath?> GetWithSectionsAndCoursesAsync(Guid id, bool withDeleted = false);
        Task<Dictionary<Guid, double>> GetAllLearningPathDurationsAsync();
        Task<List<Guid>> GetCourseIdsInLearningPathAsync(Guid learningPathId);
        Task<List<Guid>> GetRequiredCourseIdsInLearningPathAsync(Guid learningPathId);
    }
}