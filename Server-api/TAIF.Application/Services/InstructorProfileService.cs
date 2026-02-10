using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class InstructorProfileService : ServiceBase<InstructorProfile>, IInstructorProfileService
    {
        public InstructorProfileService(IInstructorProfileRepository repository) : base(repository)
        {
        }
    }
}