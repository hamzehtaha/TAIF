using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IUserEvaluationRepository : IRepository<UserEvaluation>
    {
        Task<bool> ExistsForUserAsync(Guid userId, bool withDeleted = false);
        Task<UserEvaluation?> GetByUserIdAsync(Guid userId, bool withDeleted = false);
    }
}
