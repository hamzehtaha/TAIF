using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.VideoDtos
{
    public class VideoPlaybackDto
    {
        public Guid Id { get; set; }
        public string? PlaybackId { get; set; }
        public VideoProvider Provider { get; set; }
        public string? PlaybackUrl { get; set; }
        public double DurationInSeconds { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? Title { get; set; }
        public VideoAssetStatus Status { get; set; }
    }
}
