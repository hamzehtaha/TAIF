using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class InstructorProfileRepository : RepositoryBase<InstructorProfile>, IInstructorProfileRepository
    {
        public InstructorProfileRepository(TaifDbContext context) : base(context)
        {
        }
    }
}