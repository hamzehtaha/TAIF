using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public static class JobSchedulerExtensions
    {
        public static Task<JobRequest> RunNow<THandler>(this IJobService jobService, object? payload = null) where THandler : IJobHandler
            => jobService.AddJobAsync<THandler>(payload, DateTime.UtcNow);

        public static Task<JobRequest> RunAt<THandler>(this IJobService jobService, DateTime runAt, object? payload = null) where THandler : IJobHandler
            => jobService.AddJobAsync<THandler>(payload, runAt);

        public static Task<JobRequest> RunAfter<THandler>(this IJobService jobService, TimeSpan delay, object? payload = null) where THandler : IJobHandler
            => jobService.AddJobAsync<THandler>(payload, DateTime.UtcNow.Add(delay));

        public static Task<JobRequest> RunEverySeconds<THandler>(this IJobService jobService, string jobName, int seconds, object? payload = null) where THandler : IJobHandler
            => jobService.AddRecurringJobAsync<THandler>(jobName, seconds, payload);

        public static Task<JobRequest> RunEveryMinutes<THandler>(this IJobService jobService, string jobName, int minutes, object? payload = null) where THandler : IJobHandler
            => jobService.AddRecurringJobAsync<THandler>(jobName, minutes * 60, payload);

        public static Task<JobRequest> RunEveryHours<THandler>(this IJobService jobService, string jobName, int hours, object? payload = null) where THandler : IJobHandler
            => jobService.AddRecurringJobAsync<THandler>(jobName, hours * 3600, payload);

        public static Task<JobRequest> RunDaily<THandler>(this IJobService jobService, string jobName, int hour = 0, int minute = 0, object? payload = null) where THandler : IJobHandler
        {
            var now = DateTime.UtcNow;
            var nextRun = new DateTime(now.Year, now.Month, now.Day, hour, minute, 0, DateTimeKind.Utc);
            if (nextRun <= now) nextRun = nextRun.AddDays(1);
            return jobService.AddRecurringJobAsync<THandler>(jobName, 86400, payload, nextRun);
        }
    }
}
