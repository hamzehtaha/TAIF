using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ILearningPathService : IService<LearningPath>
    {
        Task<List<LearningPathResponseDTO>> GetAllLearningPathsAsync(Guid userId);
        Task<LearningPathDetailsResponseDTO?> GetLearningPathDetailsAsync(Guid id, Guid userId);
    }
}