namespace TAIF.Domain.Entities
{
    public enum VideoAssetStatus
    {
        Pending = 0,
        Processing = 1,
        Ready = 2,
        Failed = 3
    }

    public enum VideoProvider
    {
        Mux = 0,
        CloudflareStream = 1,
        AwsMediaConvert = 2
    }

    public class VideoAsset : OrganizationBase
    {
        public Guid? LessonItemId { get; set; }
        public LessonItem? LessonItem { get; set; }

        public VideoProvider Provider { get; set; } = VideoProvider.Mux;

        public string? ProviderUploadId { get; set; }

        public string? ProviderAssetId { get; set; }

        public string? ProviderPlaybackId { get; set; }

        public double DurationInSeconds { get; set; }

        public string? ThumbnailUrl { get; set; }

        public VideoAssetStatus Status { get; set; } = VideoAssetStatus.Pending;

        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? OriginalFileName { get; set; }

        public long? FileSizeBytes { get; set; }

        public string? ErrorMessage { get; set; }

        public DateTime? ProcessedAt { get; set; }
    }
}
