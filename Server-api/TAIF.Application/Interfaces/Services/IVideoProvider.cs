using TAIF.Application.DTOs.VideoDtos;

namespace TAIF.Application.Interfaces.Services
{
    public interface IVideoProvider
    {
        Task<ProviderUploadResult> CreateDirectUploadAsync(string? correlationId = null);

        Task<ProviderUploadInfo?> GetUploadInfoAsync(string uploadId);

        Task<ProviderAssetInfo?> GetAssetInfoAsync(string assetId);

        string GeneratePlaybackUrl(string playbackId);

        string GenerateThumbnailUrl(string playbackId, int? width = null, int? height = null, double? time = null);

        /// <summary>
        /// Generates a signed JWT token for secure video playback.
        /// </summary>
        /// <param name="playbackId">The playback ID of the video</param>
        /// <param name="userId">Optional user ID for tracking and watermarking</param>
        /// <param name="userEmail">Optional user email for watermark display</param>
        /// <returns>Signed JWT token for playback</returns>
        string GenerateSignedPlaybackToken(string playbackId, string? userId = null, string? userEmail = null);

        /// <summary>
        /// Generates a signed JWT token for secure thumbnail access.
        /// </summary>
        /// <param name="playbackId">The playback ID of the video</param>
        /// <returns>Signed JWT token for thumbnail</returns>
        string GenerateSignedThumbnailToken(string playbackId);

        bool ValidateWebhookSignature(string payload, string signature, string webhookSecret);

        Task<ProviderAssetInfo?> ParseWebhookEventAsync(string payload);
    }
}
