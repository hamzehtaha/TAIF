using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class UserCourseBehaviorRepository : RepositoryBase<UserCourseBehavior>, IUserCourseBehaviorRepository
    {
        public UserCourseBehaviorRepository(TaifDbContext context) : base(context) { }
    }
}
