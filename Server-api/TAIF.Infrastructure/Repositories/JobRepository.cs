using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class JobRepository : RepositoryBase<JobRequest>, IJobRepository
    {
        private readonly TaifDbContext _context;

        public JobRepository(TaifDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<JobRequest>> GetPendingJobsAsync(int batchSize = 10)
        {
            var now = DateTime.UtcNow;
            return await _context.Set<JobRequest>()
                .Where(j => j.Status == JobStatus.Pending
                    && j.Type == JobType.OneTime
                    && j.ScheduledAt <= now
                    && !j.IsDeleted
                    && (j.LockId == null || j.LockExpiresAt < now))
                .OrderBy(j => j.ScheduledAt)
                .Take(batchSize)
                .ToListAsync();
        }

        public async Task<List<JobRequest>> GetRecurringJobsDueAsync(int batchSize = 10)
        {
            var now = DateTime.UtcNow;
            return await _context.Set<JobRequest>()
                .Where(j => j.Type == JobType.Recurring
                    && j.Status != JobStatus.Cancelled
                    && !j.IsDeleted
                    && (j.NextRunAt == null || j.NextRunAt <= now)
                    && (j.LockId == null || j.LockExpiresAt < now))
                .OrderBy(j => j.NextRunAt ?? j.ScheduledAt)
                .Take(batchSize)
                .ToListAsync();
        }

        public async Task<bool> TryAcquireLockAsync(Guid jobId, string lockId, TimeSpan lockDuration)
        {
            var now = DateTime.UtcNow;
            var lockExpiry = now.Add(lockDuration);

            var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE JobRequests 
                  SET LockId = {0}, LockExpiresAt = {1}, UpdatedAt = {2}
                  WHERE Id = {3} 
                    AND (LockId IS NULL OR LockExpiresAt < {4})
                    AND IsDeleted = 0",
                lockId, lockExpiry, now, jobId, now);

            return rowsAffected > 0;
        }

        public async Task ReleaseLockAsync(Guid jobId, string lockId)
        {
            var now = DateTime.UtcNow;
            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE JobRequests 
                  SET LockId = NULL, LockExpiresAt = NULL, UpdatedAt = {0}
                  WHERE Id = {1} AND LockId = {2}",
                now, jobId, lockId);
        }

        public async Task<bool> HasPendingJobAsync(string jobName, string handlerType)
        {
            return await _context.Set<JobRequest>()
                .AnyAsync(j => j.JobName == jobName
                    && j.HandlerType == handlerType
                    && (j.Status == JobStatus.Pending || j.Status == JobStatus.Processing)
                    && !j.IsDeleted);
        }

        public async Task CleanupCompletedJobsAsync(int daysOld = 7)
        {
            var cutoff = DateTime.UtcNow.AddDays(-daysOld);
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE JobRequests 
                  SET IsDeleted = 1, DeletedAt = {0}
                  WHERE Status = {1} 
                    AND Type = {2}
                    AND CompletedAt < {3}
                    AND IsDeleted = 0",
                now, (int)JobStatus.Completed, (int)JobType.OneTime, cutoff);
        }

        public async Task CleanupStaleLocksAsync(TimeSpan staleDuration)
        {
            var now = DateTime.UtcNow;
            var staleThreshold = now.Subtract(staleDuration);

            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE JobRequests 
                  SET LockId = NULL, LockExpiresAt = NULL, Status = {0}, UpdatedAt = {1}
                  WHERE LockExpiresAt < {2} 
                    AND Status = {3}
                    AND IsDeleted = 0",
                (int)JobStatus.Pending, now, staleThreshold, (int)JobStatus.Processing);
        }
    }
}
