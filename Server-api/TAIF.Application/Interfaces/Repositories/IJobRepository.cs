using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IJobRepository : IRepository<JobRequest>
    {
        Task<List<JobRequest>> GetPendingJobsAsync(int batchSize = 10);
        Task<List<JobRequest>> GetRecurringJobsDueAsync(int batchSize = 10);
        Task<bool> TryAcquireLockAsync(Guid jobId, string lockId, TimeSpan lockDuration);
        Task ReleaseLockAsync(Guid jobId, string lockId);
        Task<bool> HasPendingJobAsync(string jobName, string handlerType);
        Task CleanupCompletedJobsAsync(int daysOld = 7);
        Task CleanupStaleLocksAsync(TimeSpan staleDuration);
    }
}
