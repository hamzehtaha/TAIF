using TAIF.Application.DTOs.VideoDtos;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IVideoAssetService : IService<VideoAsset>
    {
        Task<VideoUploadResponseDto> CreateUploadAsync(VideoUploadRequestDto request, Guid organizationId);

        Task<VideoPlaybackDto?> GetPlaybackInfoAsync(Guid videoAssetId);

        Task<VideoAsset?> GetByProviderUploadIdAsync(string uploadId);

        Task<VideoAsset?> GetByProviderAssetIdAsync(string assetId);

        Task HandleWebhookAsync(string payload, string signature);

        /// <summary>
        /// Generates a signed playback token for secure video access.
        /// </summary>
        /// <param name="playbackId">The Mux playback ID</param>
        /// <param name="userId">User ID for tracking and watermarking</param>
        /// <param name="userEmail">User email for watermark display</param>
        /// <returns>Signed playback token DTO with token and expiry info</returns>
        SignedPlaybackTokenDto GenerateSignedPlaybackToken(string playbackId, string? userId = null, string? userEmail = null);

        /// <summary>
        /// Generates a signed playback token for a video asset by its ID.
        /// </summary>
        Task<SignedPlaybackTokenDto?> GenerateSignedPlaybackTokenByAssetIdAsync(Guid videoAssetId, string? userId = null, string? userEmail = null);
    }
}
