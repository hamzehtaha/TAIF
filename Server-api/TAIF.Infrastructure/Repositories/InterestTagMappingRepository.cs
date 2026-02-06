using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class InterestTagMappingRepository : RepositoryBase<InterestTagMapping>, IInterestTagMappingRepository
    {
        public InterestTagMappingRepository(TaifDbContext context) : base(context)
        {

        }
    }
}
