using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TAIF.Domain.Interfaces;

namespace TAIF.Domain.Entities
{
    public class Video : IContentData
    {
        [JsonPropertyName("title")]
        [Required(ErrorMessage = "Video title is required.")]
        [StringLength(300, MinimumLength = 2, ErrorMessage = "Video title must be between 2 and 300 characters.")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("url")]
        [Required(ErrorMessage = "Video URL is required.")]
        [Url(ErrorMessage = "Video URL must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "Video URL must not exceed 2048 characters.")]
        public string Url { get; set; } = null!;

        [JsonPropertyName("description")]
        [Required(ErrorMessage = "Video description is required.")]
        [StringLength(2000, ErrorMessage = "Video description must not exceed 2000 characters.")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("thumbnailUrl")]
        [Url(ErrorMessage = "Thumbnail URL must be a valid URL.")]
        [MinLength(1, ErrorMessage = "Thumbnail URL cannot be an empty string. Send null to remove it.")]
        [StringLength(2048, ErrorMessage = "Thumbnail URL must not exceed 2048 characters.")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("durationInSeconds")]
        [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
        public double DurationInSeconds { get; set; }
    }
}
