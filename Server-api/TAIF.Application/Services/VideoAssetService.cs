using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TAIF.Application.DTOs.VideoDtos;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class VideoAssetService : ServiceBase<VideoAsset>, IVideoAssetService
    {
        private readonly IVideoAssetRepository _videoAssetRepository;
        private readonly IVideoProvider _videoProvider;
        private readonly MuxOptions _muxOptions;
        private readonly ILogger<VideoAssetService> _logger;

        public VideoAssetService(
            IVideoAssetRepository repository,
            IVideoProvider videoProvider,
            IOptions<MuxOptions> muxOptions,
            ILogger<VideoAssetService> logger) : base(repository)
        {
            _videoAssetRepository = repository;
            _videoProvider = videoProvider;
            _muxOptions = muxOptions.Value;
            _logger = logger;
        }

        public async Task<VideoUploadResponseDto> CreateUploadAsync(VideoUploadRequestDto request, Guid organizationId)
        {
            var videoAsset = new VideoAsset
            {
                LessonItemId = request.LessonItemId,
                Title = request.Title,
                Description = request.Description,
                OriginalFileName = request.OriginalFileName,
                Provider = VideoProvider.Mux,
                Status = VideoAssetStatus.Pending,
                OrganizationId = organizationId
            };

            await _videoAssetRepository.AddAsync(videoAsset);
            await _videoAssetRepository.SaveChangesAsync();

            var uploadResult = await _videoProvider.CreateDirectUploadAsync(videoAsset.Id.ToString());

            videoAsset.ProviderUploadId = uploadResult.UploadId;
            _videoAssetRepository.Update(videoAsset, 
                v => v.ProviderUploadId);
            await _videoAssetRepository.SaveChangesAsync();

            _logger.LogInformation("Created video upload for asset {AssetId} with upload ID {UploadId}",
                videoAsset.Id, uploadResult.UploadId);

            return new VideoUploadResponseDto
            {
                VideoAssetId = videoAsset.Id,
                UploadUrl = uploadResult.UploadUrl,
                UploadId = uploadResult.UploadId
            };
        }

        public async Task<VideoPlaybackDto?> GetPlaybackInfoAsync(Guid videoAssetId)
        {
            var videoAsset = await _videoAssetRepository.GetByIdAsync(videoAssetId);
            
            if (videoAsset == null)
                return null;

            return new VideoPlaybackDto
            {
                Id = videoAsset.Id,
                PlaybackId = videoAsset.ProviderPlaybackId,
                Provider = videoAsset.Provider,
                PlaybackUrl = videoAsset.ProviderPlaybackId != null 
                    ? _videoProvider.GeneratePlaybackUrl(videoAsset.ProviderPlaybackId) 
                    : null,
                DurationInSeconds = videoAsset.DurationInSeconds,
                ThumbnailUrl = videoAsset.ThumbnailUrl,
                Title = videoAsset.Title,
                Status = videoAsset.Status
            };
        }

        public async Task<VideoAsset?> GetByProviderUploadIdAsync(string uploadId)
        {
            return await _videoAssetRepository.GetByProviderUploadIdAsync(uploadId);
        }

        public async Task<VideoAsset?> GetByProviderAssetIdAsync(string assetId)
        {
            return await _videoAssetRepository.GetByProviderAssetIdAsync(assetId);
        }

        public async Task<VideoAsset?> GetByLessonItemIdAsync(Guid lessonItemId)
        {
            return await _videoAssetRepository.GetByLessonItemIdAsync(lessonItemId);
        }

        public async Task HandleWebhookAsync(string payload, string signature)
        {
            if (!_videoProvider.ValidateWebhookSignature(payload, signature, _muxOptions.WebhookSecret))
            {
                _logger.LogWarning("Invalid webhook signature received");
                throw new UnauthorizedAccessException("Invalid webhook signature");
            }

            var assetInfo = await _videoProvider.ParseWebhookEventAsync(payload);
            
            if (assetInfo == null)
            {
                _logger.LogDebug("Webhook event ignored (no relevant asset info)");
                return;
            }

            VideoAsset? videoAsset = null;

            if (!string.IsNullOrEmpty(assetInfo.AssetId))
            {
                videoAsset = await _videoAssetRepository.GetByProviderAssetIdAsync(assetInfo.AssetId);
            }

            if (videoAsset == null && !string.IsNullOrEmpty(assetInfo.AssetId))
            {
                var assets = await _videoAssetRepository.FindAsync(
                    v => v.Status == VideoAssetStatus.Pending || v.Status == VideoAssetStatus.Processing);
                
                foreach (var asset in assets)
                {
                    if (!string.IsNullOrEmpty(asset.ProviderUploadId))
                    {
                        asset.ProviderAssetId = assetInfo.AssetId;
                        asset.Status = VideoAssetStatus.Processing;
                        _videoAssetRepository.Update(asset, 
                            v => v.ProviderAssetId, 
                            v => v.Status);
                        await _videoAssetRepository.SaveChangesAsync();
                        videoAsset = asset;
                        _logger.LogInformation("Linked asset {AssetId} to video {VideoId}", 
                            assetInfo.AssetId, asset.Id);
                        break;
                    }
                }
            }

            if (videoAsset == null)
            {
                _logger.LogWarning("No video asset found for provider asset ID: {AssetId}", assetInfo.AssetId);
                return;
            }

            if (assetInfo.IsReady)
            {
                videoAsset.ProviderAssetId = assetInfo.AssetId;
                videoAsset.ProviderPlaybackId = assetInfo.PlaybackId;
                videoAsset.DurationInSeconds = assetInfo.DurationInSeconds;
                videoAsset.ThumbnailUrl = assetInfo.ThumbnailUrl;
                videoAsset.Status = VideoAssetStatus.Ready;
                videoAsset.ProcessedAt = DateTime.UtcNow;

                _videoAssetRepository.Update(videoAsset,
                    v => v.ProviderAssetId,
                    v => v.ProviderPlaybackId,
                    v => v.DurationInSeconds,
                    v => v.ThumbnailUrl,
                    v => v.Status,
                    v => v.ProcessedAt);

                _logger.LogInformation("Video asset {Id} is ready. PlaybackId: {PlaybackId}, Duration: {Duration}s",
                    videoAsset.Id, assetInfo.PlaybackId, assetInfo.DurationInSeconds);
            }
            else if (!string.IsNullOrEmpty(assetInfo.ErrorMessage))
            {
                videoAsset.Status = VideoAssetStatus.Failed;
                videoAsset.ErrorMessage = assetInfo.ErrorMessage;

                _videoAssetRepository.Update(videoAsset,
                    v => v.Status,
                    v => v.ErrorMessage);

                _logger.LogError("Video asset {Id} failed: {Error}", videoAsset.Id, assetInfo.ErrorMessage);
            }

            await _videoAssetRepository.SaveChangesAsync();
        }
    }
}
