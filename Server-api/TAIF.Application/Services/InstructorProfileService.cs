using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class InstructorProfileService : ServiceBase<InstructorProfile>, IInstructorProfileService
    {
        private readonly IInstructorProfileRepository _repo;
        public InstructorProfileService(IInstructorProfileRepository repository) : base(repository)
        {
            _repo = repository;
        }

        public async Task<InstructorProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _repo.GetByUserIdAsync(userId);
        }
    }
}
