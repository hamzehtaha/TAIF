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
    public class EvaluationQuestionRepository
       : RepositoryBase<EvaluationQuestion>, IEvaluationQuestionRepository
    {
        private readonly TaifDbContext _context;

        public EvaluationQuestionRepository(TaifDbContext context)
            : base(context)
        {
            _context = context;
        }

        public async Task<List<EvaluationQuestion>> GetAllWithAnswersAsync(bool withDeleted = false)
        {
            IQueryable<EvaluationQuestion> query = _context.EvaluationQuestions;

            if (!withDeleted)
                query = query.Where(q => !q.IsDeleted);

            return await query
                .Include(q => q.Answers)
                .OrderBy(q => q.Order)
                .ToListAsync();
        }
    }
}
