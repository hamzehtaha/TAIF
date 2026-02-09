using System;

namespace TAIF.Domain.Entities
{
    public enum JobStatus
    {
        Pending = 0,
        Processing = 1,
        Completed = 2,
        Failed = 3,
        Cancelled = 4
    }

    public enum JobType
    {
        OneTime = 0,
        Recurring = 1
    }

    public class JobRequest : Base
    {
        public string JobName { get; set; } = null!;
        public string HandlerType { get; set; } = null!;
        public string? Payload { get; set; }
        public JobType Type { get; set; } = JobType.OneTime;
        public JobStatus Status { get; set; } = JobStatus.Pending;
        public DateTime ScheduledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int RetryCount { get; set; } = 0;
        public int MaxRetries { get; set; } = 3;
        public string? ErrorMessage { get; set; }
        public int? IntervalSeconds { get; set; }
        public DateTime? NextRunAt { get; set; }
        public DateTime? LastRunAt { get; set; }
        public string? LockId { get; set; }
        public DateTime? LockExpiresAt { get; set; }
    }
}
