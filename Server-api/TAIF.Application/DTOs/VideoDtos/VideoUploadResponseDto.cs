namespace TAIF.Application.DTOs.VideoDtos
{
    public class VideoUploadResponseDto
    {
        public Guid VideoAssetId { get; set; }
        public string UploadUrl { get; set; } = null!;
        public string? UploadId { get; set; }
    }
}
