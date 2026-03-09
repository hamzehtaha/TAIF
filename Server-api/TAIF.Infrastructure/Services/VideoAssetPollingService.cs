using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Infrastructure.Services
{
    /// <summary>
    /// Background service that polls Mux API to check status of pending video assets.
    /// TODO: Enable Webhook instead of long polling for production use.
    /// This polling approach is used as a temporary solution while webhooks are not configured.
    /// </summary>
    public class VideoAssetPollingService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<VideoAssetPollingService> _logger;
        private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(10);

        public VideoAssetPollingService(
            IServiceProvider serviceProvider,
            ILogger<VideoAssetPollingService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("VideoAssetPollingService started. Polling interval: {Interval}s", 
                _pollingInterval.TotalSeconds);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PollPendingAssetsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during video asset polling");
                }

                await Task.Delay(_pollingInterval, stoppingToken);
            }

            _logger.LogInformation("VideoAssetPollingService stopped");
        }

        private async Task PollPendingAssetsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var videoAssetRepository = scope.ServiceProvider.GetRequiredService<IVideoAssetRepository>();
            var videoProvider = scope.ServiceProvider.GetRequiredService<IVideoProvider>();

            // Get all pending or processing video assets
            var pendingAssets = await videoAssetRepository.FindAsync(
                v => (v.Status == VideoAssetStatus.Pending || v.Status == VideoAssetStatus.Processing)
                     && !string.IsNullOrEmpty(v.ProviderUploadId));

            if (!pendingAssets.Any())
            {
                return;
            }

            _logger.LogDebug("Polling {Count} pending video assets", pendingAssets.Count());

            foreach (var videoAsset in pendingAssets)
            {
                if (stoppingToken.IsCancellationRequested)
                    break;

                try
                {
                    await UpdateAssetFromMuxAsync(videoAsset, videoProvider, videoAssetRepository);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to poll status for video asset {AssetId}", videoAsset.Id);
                }
            }
        }

        private async Task UpdateAssetFromMuxAsync(
            VideoAsset videoAsset, 
            IVideoProvider videoProvider,
            IVideoAssetRepository videoAssetRepository)
        {
            // First get upload info to find the asset ID
            var uploadInfo = await videoProvider.GetUploadInfoAsync(videoAsset.ProviderUploadId!);

            if (uploadInfo == null)
            {
                _logger.LogDebug("Upload {UploadId} info not available yet", videoAsset.ProviderUploadId);
                return;
            }

            // If upload has an asset ID but we haven't stored it yet
            if (!string.IsNullOrEmpty(uploadInfo.AssetId) && string.IsNullOrEmpty(videoAsset.ProviderAssetId))
            {
                videoAsset.ProviderAssetId = uploadInfo.AssetId;
                videoAsset.Status = VideoAssetStatus.Processing;
                
                videoAssetRepository.Update(videoAsset,
                    v => v.ProviderAssetId,
                    v => v.Status);
                await videoAssetRepository.SaveChangesAsync();

                _logger.LogInformation("Video asset {Id} linked to Mux asset {AssetId}, status: Processing",
                    videoAsset.Id, uploadInfo.AssetId);
            }

            // If we have an asset ID, get the full asset info
            if (!string.IsNullOrEmpty(videoAsset.ProviderAssetId))
            {
                var assetInfo = await videoProvider.GetAssetInfoAsync(videoAsset.ProviderAssetId);

                if (assetInfo == null)
                {
                    _logger.LogDebug("Asset {AssetId} info not available yet", videoAsset.ProviderAssetId);
                    return;
                }

                if (assetInfo.IsReady && !string.IsNullOrEmpty(assetInfo.PlaybackId))
                {
                    // Asset is ready - update with playback info
                    videoAsset.ProviderPlaybackId = assetInfo.PlaybackId;
                    videoAsset.DurationInSeconds = assetInfo.DurationInSeconds;
                    videoAsset.ThumbnailUrl = assetInfo.ThumbnailUrl;
                    videoAsset.Status = VideoAssetStatus.Ready;
                    videoAsset.ProcessedAt = DateTime.UtcNow;

                    videoAssetRepository.Update(videoAsset,
                        v => v.ProviderPlaybackId,
                        v => v.DurationInSeconds,
                        v => v.ThumbnailUrl,
                        v => v.Status,
                        v => v.ProcessedAt);
                    await videoAssetRepository.SaveChangesAsync();

                    _logger.LogInformation(
                        "Video asset {Id} is now Ready. PlaybackId: {PlaybackId}, Duration: {Duration}s",
                        videoAsset.Id, assetInfo.PlaybackId, assetInfo.DurationInSeconds);
                }
                else if (!string.IsNullOrEmpty(assetInfo.ErrorMessage))
                {
                    // Asset failed
                    videoAsset.Status = VideoAssetStatus.Failed;
                    videoAsset.ErrorMessage = assetInfo.ErrorMessage;

                    videoAssetRepository.Update(videoAsset,
                        v => v.Status,
                        v => v.ErrorMessage);
                    await videoAssetRepository.SaveChangesAsync();

                    _logger.LogError("Video asset {Id} failed: {Error}", videoAsset.Id, assetInfo.ErrorMessage);
                }
            }
        }
    }
}
