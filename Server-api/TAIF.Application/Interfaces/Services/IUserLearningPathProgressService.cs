using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IUserLearningPathProgressService : IService<UserLearningPathProgress>
    {
        Task<List<LearningPathResponseDTO>> GetUserEnrolledLearningPathsAsync(Guid userId);
        Task<LearningPathProgressResponseDTO?> GetLearningPathWithProgressAsync(Guid learningPathId, Guid userId);
        Task<EnrollmentStatusResponseDTO> GetEnrollmentStatusAsync(Guid userId, Guid learningPathId);
        Task<UserLearningPathProgress> EnrollUserAsync(Guid userId, Guid learningPathId);
        
        Task<double> CalculateUserCompletedDurationAsync(Guid userId, Guid learningPathId);
        Task UpdateProgressAsync(Guid userId, Guid learningPathId);
    }
}