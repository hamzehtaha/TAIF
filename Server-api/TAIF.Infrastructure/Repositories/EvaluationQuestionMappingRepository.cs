using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Models;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class EvaluationQuestionMappingRepository : RepositoryBase<EvaluationQuestionMapping>, IEvaluationQuestionMappingRepository
    {
        private readonly TaifDbContext _context;

        public EvaluationQuestionMappingRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<EvaluationQuestionMapping>> GetByEvaluationIdAsync(Guid evaluationId, bool withDeleted = false)
        {
            IQueryable<EvaluationQuestionMapping> query = _context.EvaluationQuestionMappings;

            if (!withDeleted)
                query = query.Where(m => !m.IsDeleted);

            return await query
                .Where(m => m.EvaluationId == evaluationId)
                .OrderBy(m => m.Order)
                .ToListAsync();
        }
    }
}
