using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IInstructorProfileService : IService<InstructorProfile>
    {
        Task<InstructorProfile> CreateWithAutoOrgAsync(InstructorProfile entity);
        Task<InstructorProfile?> GetByUserIdAsync(Guid userId);
        Task<InstructorProfileResponse?> GetProfileByUserIdAsync(Guid userId);
        Task<InstructorProfileResponse?> UpdateProfileAsync(Guid userId, UpdateInstructorProfileRequest request);
    }
}