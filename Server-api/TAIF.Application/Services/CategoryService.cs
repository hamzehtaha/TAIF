using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CategoryService : ServiceBase<Category>, ICategoryService
    {
        private readonly ICacheService _cache;
        private readonly CacheOptions _cacheOptions;
        private const string CategoriesCacheKey = "all_categories";

        public CategoryService(ICategoryRepository repository, ICacheService cache, IOptions<CacheOptions> cacheOptions) : base(repository)
        {
            _cache = cache;
            _cacheOptions = cacheOptions.Value;
        }

        public override async Task<List<Category>> GetAllAsync(bool withDeleted = false)
        {
            if (!withDeleted)
            {
                var cached = await _cache.GetAsync<List<Category>>(CategoriesCacheKey);
                if (cached != null)
                    return cached;
            }

            var categories = await base.GetAllAsync(withDeleted);

            if (!withDeleted)
            {
                await _cache.SetAsync(CategoriesCacheKey, categories, TimeSpan.FromMinutes(_cacheOptions.CategoryTtlMinutes));
            }

            return categories;
        }

        public override async Task<Category> CreateAsync(Category entity)
        {
            var result = await base.CreateAsync(entity);
            await _cache.RemoveAsync(CategoriesCacheKey);
            return result;
        }
    }
}
