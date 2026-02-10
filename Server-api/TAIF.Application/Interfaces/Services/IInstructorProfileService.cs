using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IInstructorProfileService : IService<InstructorProfile>
    {
        Task<InstructorProfile> CreateWithAutoOrgAsync(InstructorProfile entity);
    }
}