using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

/// <summary>
/// Request DTO for creating video content.
/// For Mux videos: videoAssetId is required, playbackId and thumbnailUrl are optional (can be set manually or fetched from Mux).
/// </summary>
public class CreateVideoRequest
{
    [Required(ErrorMessage = "Video title is required.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 300 characters.")]
    public string Title { get; set; } = null!;

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    [StringLength(2048, ErrorMessage = "Thumbnail URL must not exceed 2048 characters.")]
    public string? ThumbnailUrl { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
    public double DurationInSeconds { get; set; }

    public Guid? VideoAssetId { get; set; }

    public string? PlaybackId { get; set; }

    public string Provider { get; set; } = "Mux";
}
