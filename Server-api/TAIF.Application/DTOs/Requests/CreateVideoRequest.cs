namespace TAIF.Application.DTOs.Requests;

public class CreateVideoRequest
{
    public string Url { get; set; } = null!;
    public string? ThumbnailUrl { get; set; }
    public double DurationInSeconds { get; set; }
}
