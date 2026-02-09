using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class InstructorProfileRepository : RepositoryBase<InstructorProfile>, IInstructorProfileRepository
    {
        private readonly TaifDbContext _context;

        public InstructorProfileRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<InstructorProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _context.InstructorProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
