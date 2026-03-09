namespace TAIF.Application.DTOs.VideoDtos
{
    public class ProviderAssetInfo
    {
        public string AssetId { get; set; } = null!;
        public string? PlaybackId { get; set; }
        public double DurationInSeconds { get; set; }
        public string? ThumbnailUrl { get; set; }
        public bool IsReady { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
