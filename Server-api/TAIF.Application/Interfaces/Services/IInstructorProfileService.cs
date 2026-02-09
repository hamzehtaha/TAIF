using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IInstructorProfileService : IService<InstructorProfile>
    {
        Task<InstructorProfile?> GetByUserIdAsync(Guid userId);
    }
}
