namespace TAIF.Application.Interfaces.Services
{
    public interface ILearningPathStatisticsService
    {
        Task UpdateAllLearningPathStatisticsAsync();
        Task<bool> UpdateLearningPathStatisticsAsync(Guid learningPathId);
    }
}