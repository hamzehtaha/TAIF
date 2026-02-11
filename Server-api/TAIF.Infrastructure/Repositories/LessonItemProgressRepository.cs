using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class LessonItemProgressRepository : RepositoryBase<LessonItemProgress>, ILessonItemProgressRepository
    {
        private readonly TaifDbContext _taifContext;

        public LessonItemProgressRepository(TaifDbContext context) : base(context)
        {
            _taifContext = context;
        }

        public async Task<double> GetCompletedDurationSumAsync(Guid userId, Guid courseId)
        {
            return await _taifContext.LessonItemProgress
                .Where(p => p.UserId == userId && p.CourseID == courseId)
                .SumAsync(p => p.CompletedDurationInSeconds);
        }
    }
}
