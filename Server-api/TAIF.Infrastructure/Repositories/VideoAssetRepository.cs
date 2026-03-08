using Microsoft.EntityFrameworkCore;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class VideoAssetRepository : RepositoryBase<VideoAsset>, IVideoAssetRepository
    {
        public VideoAssetRepository(TaifDbContext context) : base(context)
        {
        }

        public async Task<VideoAsset?> GetByProviderUploadIdAsync(string uploadId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(v => v.ProviderUploadId == uploadId && !v.IsDeleted);
        }

        public async Task<VideoAsset?> GetByProviderAssetIdAsync(string assetId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(v => v.ProviderAssetId == assetId && !v.IsDeleted);
        }

        public async Task<VideoAsset?> GetByLessonItemIdAsync(Guid lessonItemId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(v => v.LessonItemId == lessonItemId && !v.IsDeleted);
        }
    }
}
