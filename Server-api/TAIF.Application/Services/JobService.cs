using System.Text.Json;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class JobService : ServiceBase<JobRequest>, IJobService
    {
        private readonly IJobRepository _jobRepository;

        public JobService(IJobRepository jobRepository) : base(jobRepository)
        {
            _jobRepository = jobRepository;
        }

        public Task<JobRequest> AddJobAsync<THandler>(object? payload = null, DateTime? scheduledAt = null) where THandler : IJobHandler
        {
            return AddJobAsync(typeof(THandler), payload, scheduledAt);
        }

        public async Task<JobRequest> AddJobAsync(Type handlerType, object? payload = null, DateTime? scheduledAt = null)
        {
            var job = new JobRequest
            {
                Id = Guid.NewGuid(),
                JobName = $"{handlerType.Name}_{Guid.NewGuid():N}",
                HandlerType = handlerType.AssemblyQualifiedName!,
                Payload = payload != null ? JsonSerializer.Serialize(payload) : null,
                Type = JobType.OneTime,
                Status = JobStatus.Pending,
                ScheduledAt = scheduledAt ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _jobRepository.AddAsync(job);
            await _jobRepository.SaveChangesAsync();
            return job;
        }

        public Task<JobRequest> AddRecurringJobAsync<THandler>(string jobName, int intervalSeconds, object? payload = null, DateTime? startAt = null) where THandler : IJobHandler
        {
            return AddRecurringJobAsync(typeof(THandler), jobName, intervalSeconds, payload, startAt);
        }

        public async Task<JobRequest> AddRecurringJobAsync(Type handlerType, string jobName, int intervalSeconds, object? payload = null, DateTime? startAt = null)
        {
            var handlerTypeName = handlerType.AssemblyQualifiedName!;
            var hasPending = await _jobRepository.HasPendingJobAsync(jobName, handlerTypeName);
            if (hasPending)
            {
                var existingJobs = await GetJobsByNameAsync(jobName);
                var existingJob = existingJobs.FirstOrDefault(j => j.HandlerType == handlerTypeName && j.Type == JobType.Recurring);
                if (existingJob != null)
                {
                    existingJob.IntervalSeconds = intervalSeconds;
                    existingJob.Payload = payload != null ? JsonSerializer.Serialize(payload) : null;
                    existingJob.UpdatedAt = DateTime.UtcNow;
                    this.UpdateAsync(existingJob, existingJob);
                    await _jobRepository.SaveChangesAsync();
                    return existingJob;
                }
            }

            var scheduledTime = startAt ?? DateTime.UtcNow;
            var job = new JobRequest
            {
                Id = Guid.NewGuid(),
                JobName = jobName,
                HandlerType = handlerTypeName,
                Payload = payload != null ? JsonSerializer.Serialize(payload) : null,
                Type = JobType.Recurring,
                Status = JobStatus.Pending,
                ScheduledAt = scheduledTime,
                IntervalSeconds = intervalSeconds,
                NextRunAt = scheduledTime,
                CreatedAt = DateTime.UtcNow
            };

            await _jobRepository.AddAsync(job);
            await _jobRepository.SaveChangesAsync();
            return job;
        }

        public async Task<JobRequest?> GetJobByIdAsync(Guid jobId)
        {
            return await _jobRepository.GetByIdAsync(jobId);
        }

        public async Task<List<JobRequest>> GetJobsByNameAsync(string jobName)
        {
            return await _jobRepository.FindNoTrackingAsync(j => j.JobName == jobName && !j.IsDeleted);
        }

        public async Task<bool> CancelJobAsync(Guid jobId)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null || job.Status == JobStatus.Completed || job.Status == JobStatus.Cancelled)
                return false;

            job.Status = JobStatus.Cancelled;
            job.UpdatedAt = DateTime.UtcNow;
            _jobRepository.Update(job);
            await _jobRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelRecurringJobAsync(string jobName)
        {
            var jobs = await GetJobsByNameAsync(jobName);
            var recurringJobs = jobs.Where(j => j.Type == JobType.Recurring && j.Status != JobStatus.Cancelled).ToList();

            foreach (var job in recurringJobs)
            {
                job.Status = JobStatus.Cancelled;
                job.UpdatedAt = DateTime.UtcNow;
                _jobRepository.Update(job);
            }
            await _jobRepository.SaveChangesAsync();

            return recurringJobs.Count > 0;
        }

        public async Task UpdateJobStatusAsync(Guid jobId, JobStatus status, string? errorMessage = null)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null) return;

            job.Status = status;
            job.ErrorMessage = errorMessage;
            job.UpdatedAt = DateTime.UtcNow;

            if (status == JobStatus.Processing)
                job.StartedAt = DateTime.UtcNow;

            _jobRepository.Update(job);
            await _jobRepository.SaveChangesAsync();
        }

        public async Task MarkJobCompletedAsync(Guid jobId)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null) return;

            job.Status = JobStatus.Completed;
            job.CompletedAt = DateTime.UtcNow;
            job.UpdatedAt = DateTime.UtcNow;
            job.LastRunAt = DateTime.UtcNow;
            job.LockId = null;
            job.LockExpiresAt = null;

            _jobRepository.Update(job);
            await _jobRepository.SaveChangesAsync();
        }

        public async Task MarkJobFailedAsync(Guid jobId, string errorMessage)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null) return;

            job.RetryCount++;
            job.ErrorMessage = errorMessage;
            job.UpdatedAt = DateTime.UtcNow;
            job.LockId = null;
            job.LockExpiresAt = null;

            if (job.RetryCount >= job.MaxRetries)
            {
                job.Status = JobStatus.Failed;
            }
            else
            {
                job.Status = JobStatus.Pending;
                job.ScheduledAt = DateTime.UtcNow.AddSeconds(Math.Pow(2, job.RetryCount) * 10);
            }

            _jobRepository.Update(job);
            await _jobRepository.SaveChangesAsync();
        }

        public async Task ScheduleNextRunAsync(Guid jobId)
        {
            var job = await _jobRepository.GetByIdAsync(jobId);
            if (job == null || job.Type != JobType.Recurring || job.IntervalSeconds == null) return;

            job.NextRunAt = DateTime.UtcNow.AddSeconds(job.IntervalSeconds.Value);
            job.LastRunAt = DateTime.UtcNow;
            job.Status = JobStatus.Pending;
            job.LockId = null;
            job.LockExpiresAt = null;
            job.UpdatedAt = DateTime.UtcNow;

            _jobRepository.Update(job);
            await _jobRepository.SaveChangesAsync();
        }
    }
}
