namespace TAIF.Application.DTOs.VideoDtos
{
    public class ProviderUploadInfo
    {
        public string UploadId { get; set; } = null!;
        public string? AssetId { get; set; }
        public string Status { get; set; } = null!;
        public bool IsAssetCreated => !string.IsNullOrEmpty(AssetId);
    }
}
