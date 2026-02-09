using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.BackgroundJob
{
    public class BackgroundJobProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackgroundJobProcessor> _logger;
        private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(5);
        private readonly TimeSpan _lockDuration = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1);
        private DateTime _lastCleanup = DateTime.MinValue;

        public BackgroundJobProcessor(
            IServiceProvider serviceProvider,
            ILogger<BackgroundJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background Job Processor started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessJobsAsync(stoppingToken);
                    await PerformMaintenanceAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in job processing loop");
                }

                await Task.Delay(_pollingInterval, stoppingToken);
            }

            _logger.LogInformation("Background Job Processor stopped");
        }

        private async Task ProcessJobsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var jobRepository = scope.ServiceProvider.GetRequiredService<IJobRepository>();
            var jobService = scope.ServiceProvider.GetRequiredService<IJobService>();

            var oneTimeJobs = await jobRepository.GetPendingJobsAsync(10);
            var recurringJobs = await jobRepository.GetRecurringJobsDueAsync(10);

            var allJobs = oneTimeJobs.Concat(recurringJobs).ToList();

            foreach (var job in allJobs)
            {
                if (stoppingToken.IsCancellationRequested) break;
                await ProcessSingleJobAsync(job, jobRepository, jobService, stoppingToken);
            }
        }

        private async Task ProcessSingleJobAsync(
            JobRequest job,
            IJobRepository jobRepository,
            IJobService jobService,
            CancellationToken stoppingToken)
        {
            var lockId = Guid.NewGuid().ToString();

            var acquired = await jobRepository.TryAcquireLockAsync(job.Id, lockId, _lockDuration);
            if (!acquired)
            {
                _logger.LogDebug("Could not acquire lock for job {JobId}, skipping", job.Id);
                return;
            }

            try
            {
                _logger.LogInformation("Processing job {JobId} ({JobName})", job.Id, job.JobName);

                await jobService.UpdateJobStatusAsync(job.Id, JobStatus.Processing);

                var handlerType = Type.GetType(job.HandlerType);
                if (handlerType == null)
                {
                    _logger.LogError("Handler type not found: {HandlerType}", job.HandlerType);
                    await jobService.MarkJobFailedAsync(job.Id, $"Handler type not found: {job.HandlerType}");
                    return;
                }

                using var handlerScope = _serviceProvider.CreateScope();
                var handler = ActivatorUtilities.CreateInstance(handlerScope.ServiceProvider, handlerType) as IJobHandler;
                
                if (handler == null)
                {
                    _logger.LogError("Could not create handler instance for type: {HandlerType}", job.HandlerType);
                    await jobService.MarkJobFailedAsync(job.Id, $"Could not create handler: {job.HandlerType}");
                    return;
                }

                await handler.ExecuteAsync(job.Payload, stoppingToken);

                if (job.Type == JobType.Recurring)
                {
                    await jobService.ScheduleNextRunAsync(job.Id);
                    _logger.LogInformation("Recurring job {JobId} completed, next run scheduled", job.Id);
                }
                else
                {
                    await jobService.MarkJobCompletedAsync(job.Id);
                    _logger.LogInformation("One-time job {JobId} completed", job.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing job {JobId}", job.Id);
                await jobService.MarkJobFailedAsync(job.Id, ex.Message);
            }
            finally
            {
                await jobRepository.ReleaseLockAsync(job.Id, lockId);
            }
        }

        private async Task PerformMaintenanceAsync(CancellationToken stoppingToken)
        {
            if (DateTime.UtcNow - _lastCleanup < _cleanupInterval) return;

            using var scope = _serviceProvider.CreateScope();
            var jobRepository = scope.ServiceProvider.GetRequiredService<IJobRepository>();

            try
            {
                await jobRepository.CleanupStaleLocksAsync(TimeSpan.FromMinutes(10));
                await jobRepository.CleanupCompletedJobsAsync(7);
                _lastCleanup = DateTime.UtcNow;
                _logger.LogInformation("Job maintenance completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during job maintenance");
            }
        }
    }
}
