using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IInstructorProfileRepository : IRepository<InstructorProfile>
    {
        Task<InstructorProfile?> GetByUserIdAsync(Guid userId);
        Task<InstructorProfile?> GetByUserIdWithUserAsync(Guid userId);
    }
}