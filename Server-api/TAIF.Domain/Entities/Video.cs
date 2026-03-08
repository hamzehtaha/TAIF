using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class Video : IContentData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;
        
        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }
        
        [JsonPropertyName("durationInSeconds")]
        public double DurationInSeconds { get; set; }

        [JsonPropertyName("videoAssetId")]
        public Guid? VideoAssetId { get; set; }

        [JsonPropertyName("playbackId")]
        public string? PlaybackId { get; set; }

        [JsonPropertyName("provider")]
        public string? Provider { get; set; }
    }
}
