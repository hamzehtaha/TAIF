using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class Video : IContentData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;
        
        [JsonPropertyName("url")]
        public string Url { get; set; } = null!;
        
        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }
        
        [JsonPropertyName("durationInSeconds")]
        public double DurationInSeconds { get; set; }
    }
}
