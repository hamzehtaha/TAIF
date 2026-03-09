using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Video content data stored in Content.ContentJson.
    /// For Mux videos: videoAssetId + playbackId are the primary identifiers.
    /// ThumbnailUrl is auto-generated from Mux using the playbackId.
    /// </summary>
    public class Video : IContentData
    {
        [JsonPropertyName("title")]
        [Required(ErrorMessage = "Video title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Video title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("description")]
        [StringLength(2000, ErrorMessage = "Video description must not exceed 2000 characters.")]
        public string? Description { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        [StringLength(2048, ErrorMessage = "Thumbnail URL must not exceed 2048 characters.")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("durationInSeconds")]
        [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
        public double DurationInSeconds { get; set; }

        [JsonPropertyName("videoAssetId")]
        public Guid? VideoAssetId { get; set; }

        [JsonPropertyName("playbackId")]
        public string? PlaybackId { get; set; }

        [JsonPropertyName("provider")]
        public string Provider { get; set; } = "Mux";
    }
}
