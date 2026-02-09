using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IJobService
    {
        Task<JobRequest> AddJobAsync<THandler>(object? payload = null, DateTime? scheduledAt = null) where THandler : IJobHandler;
        Task<JobRequest> AddJobAsync(Type handlerType, object? payload = null, DateTime? scheduledAt = null);
        Task<JobRequest> AddRecurringJobAsync<THandler>(string jobName, int intervalSeconds, object? payload = null, DateTime? startAt = null) where THandler : IJobHandler;
        Task<JobRequest> AddRecurringJobAsync(Type handlerType, string jobName, int intervalSeconds, object? payload = null, DateTime? startAt = null);
        Task<JobRequest?> GetJobByIdAsync(Guid jobId);
        Task<List<JobRequest>> GetJobsByNameAsync(string jobName);
        Task<bool> CancelJobAsync(Guid jobId);
        Task<bool> CancelRecurringJobAsync(string jobName);
        Task UpdateJobStatusAsync(Guid jobId, JobStatus status, string? errorMessage = null);
        Task MarkJobCompletedAsync(Guid jobId);
        Task MarkJobFailedAsync(Guid jobId, string errorMessage);
        Task ScheduleNextRunAsync(Guid jobId);
    }
}
