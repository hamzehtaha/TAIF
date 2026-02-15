using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IUserService : IService<User>
    {
        Task<User?> GetByIdWithOrganizationAsync(Guid id);
    }
}
