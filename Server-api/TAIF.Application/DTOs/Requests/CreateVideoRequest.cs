using System.ComponentModel.DataAnnotations;

namespace TAIF.Application.DTOs.Requests;

public class CreateVideoRequest
{
    [Required(ErrorMessage = "Video URL is required.")]
    [Url(ErrorMessage = "Video URL must be a valid URL.")]
    [StringLength(2048, ErrorMessage = "Video URL must not exceed 2048 characters.")]
    public string Url { get; set; } = null!;

    [Url(ErrorMessage = "Thumbnail URL must be a valid URL.")]
    [StringLength(2048, ErrorMessage = "Thumbnail URL must not exceed 2048 characters.")]
    public string? ThumbnailUrl { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Duration must be zero or a positive number.")]
    public double DurationInSeconds { get; set; }
}
