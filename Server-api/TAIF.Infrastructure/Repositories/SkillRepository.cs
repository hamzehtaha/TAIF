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
    public class SkillRepository : RepositoryBase<Skill>, ISkillRepository
    {
        private readonly TaifDbContext _context;
        public SkillRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
