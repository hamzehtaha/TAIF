using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IInstructorProfileRepository : IRepository<InstructorProfile>
    {
        Task<InstructorProfile?> GetByUserIdAsync(Guid userId);
    }
}
