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

        public async Task<double> GetCompletedDurationSumForCoursesAsync(Guid userId, List<Guid> courseIds)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(lip => lip.UserId == userId && courseIds.Contains(lip.CourseID) && !lip.IsDeleted)
                .SumAsync(lip => lip.CompletedDurationInSeconds);
        }

        // Add this method
        public async Task<(int CompletedCount, int TotalItems)> GetCompletionStatsAsync(Guid userId, Guid courseId, int totalLessonItems)
        {
            var completedCount = await _taifContext.LessonItemProgress
                .Where(lip => lip.UserId == userId && 
                              lip.CourseID == courseId && 
                              lip.IsCompleted && 
                              !lip.IsDeleted)
                .CountAsync();

            return (completedCount, totalLessonItems);
        }

        // OPTIMIZED: Use CountAsync directly
        public async Task<int> GetCompletedItemCountAsync(Guid userId, Guid courseId)
        {
            return await _taifContext.LessonItemProgress
                .Where(lip => lip.UserId == userId && 
                              lip.CourseID == courseId && 
                              lip.IsCompleted &&
                              !lip.IsDeleted)
                .CountAsync();
        }
    }
}
