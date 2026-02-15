using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IUserLearningPathProgressRepository : IRepository<UserLearningPathProgress>
    {
        Task<List<UserLearningPathProgress>> GetUserLearningPathsWithDetailsAsync(Guid userId);
        Task<UserLearningPathProgress?> GetUserProgressWithDetailsAsync(Guid userId, Guid learningPathId);
        Task<List<UserLearningPathProgress>> GetUserLearningPathsAsync(Guid userId, bool withDeleted = false);
        Task<UserLearningPathProgress?> GetUserProgressAsync(Guid userId, Guid learningPathId, bool withDeleted = false);
        Task<Dictionary<Guid, int>> GetEnrollmentCountsPerLearningPathAsync();
    }
}