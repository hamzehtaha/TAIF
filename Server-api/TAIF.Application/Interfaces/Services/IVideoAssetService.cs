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
    }
}
