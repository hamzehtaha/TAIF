using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonItemProgressRepository : RepositoryBase<LessonItemProgress>, ILessonItemProgressRepository
    {
        public LessonItemProgressRepository(TaifDbContext context) : base(context)
        {

        }

        public async Task<double> SumCompletedDurationAsync(Guid userId, Guid courseId)
        {
            return await _dbSet
                .Where(p => p.UserId == userId && p.CourseID == courseId && !p.IsDeleted)
                .SumAsync(p => p.CompletedDurationInSeconds);
        }
    }
}
