using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories
{
    public interface IVideoAssetRepository : IRepository<VideoAsset>
    {
        Task<VideoAsset?> GetByProviderUploadIdAsync(string uploadId);
        Task<VideoAsset?> GetByProviderAssetIdAsync(string assetId);
        Task<VideoAsset?> GetByLessonItemIdAsync(Guid lessonItemId);
    }
}
