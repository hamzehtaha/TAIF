using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class InterestRepository : RepositoryBase<Interest>, IInterestRepository
    {
        public InterestRepository(TaifDbContext context) : base(context)
        {
        }
    }
}
