using TAIF.Application.DTOs;
using TAIF.Application.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IRecommendationService
    {
        Task<List<Course>> GetRecommendedCoursesAsync(Guid userId, int count = 10);
        Task RecordEventAsync(Guid userId, Guid courseId, BehaviorEventType eventType);
    }
}
