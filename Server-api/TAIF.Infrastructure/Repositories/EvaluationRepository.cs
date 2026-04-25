using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class EvaluationRepository : RepositoryBase<Evaluation>, IEvaluationRepository
    {
        private readonly TaifDbContext _context;

        public EvaluationRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public override async Task<Evaluation?> GetByIdAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            IQueryable<Evaluation> query = _context.Evaluations
                .Include(e => e.QuestionMappings);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public override async Task<List<Evaluation>> GetAllAsync(bool withDeleted = false, Expression<Func<Evaluation, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            IQueryable<Evaluation> query = _context.Evaluations
                .Include(e => e.QuestionMappings);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            if (orderBy != null)
            {
                query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
            }

            return await query.ToListAsync(cancellationToken);
        }

        public override async Task<List<Evaluation>> FindNoTrackingAsync(Expression<Func<Evaluation, bool>> predicate, bool withDeleted = false, Expression<Func<Evaluation, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            IQueryable<Evaluation> query = _context.Evaluations
                .AsNoTracking()
                .Include(e => e.QuestionMappings);

            if (!withDeleted)
                query = query.Where(e => !e.IsDeleted);

            query = query.Where(predicate);

            if (orderBy != null)
            {
                query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
            }

            return await query.ToListAsync(cancellationToken);
        }

        // Bypasses the global tenant filter so that null-org (global) evaluations
        // created by SuperAdmin are visible to all organisation-scoped users.
        public async Task<List<Evaluation>> GetByInterestIdsAsync(List<Guid> interestIds)
        {
            return await _context.Evaluations
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Include(e => e.QuestionMappings)
                .Where(e => !e.IsDeleted && e.InterestId.HasValue && interestIds.Contains(e.InterestId.Value))
                .ToListAsync();
        }
    }
}
