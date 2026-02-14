using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LearningPathSectionRepository : RepositoryBase<LearningPathSection>, ILearningPathSectionRepository
    {
        public LearningPathSectionRepository(TaifDbContext context) : base(context)
        {
        }
    }
}