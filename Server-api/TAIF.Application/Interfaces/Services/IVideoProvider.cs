using TAIF.Application.DTOs.VideoDtos;

namespace TAIF.Application.Interfaces.Services
{
    public interface IVideoProvider
    {
        Task<ProviderUploadResult> CreateDirectUploadAsync(string? correlationId = null);

        Task<ProviderAssetInfo?> GetAssetInfoAsync(string assetId);

        string GeneratePlaybackUrl(string playbackId);

        string GenerateThumbnailUrl(string playbackId, int? width = null, int? height = null, double? time = null);

        bool ValidateWebhookSignature(string payload, string signature, string webhookSecret);

        Task<ProviderAssetInfo?> ParseWebhookEventAsync(string payload);
    }
}
