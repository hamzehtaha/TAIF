using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using TAIF.Application.Interfaces.Services;
using TAIF.Application.Options;

namespace TAIF.Infrastructure.Services;

/// <summary>
/// In-memory implementation of <see cref="ICacheService"/>.
/// Swap this registration with a Redis-backed implementation when ready.
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly CacheOptions _options;

    public MemoryCacheService(IMemoryCache cache, IOptions<CacheOptions> options)
    {
        _cache = cache;
        _options = options.Value;
    }

    public Task<T?> GetAsync<T>(string key)
    {
        _cache.TryGetValue(key, out T? value);
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var ttl = expiration ?? TimeSpan.FromMinutes(_options.DefaultTtlMinutes);
        _cache.Set(key, value, ttl);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
    {
        if (_cache.TryGetValue(key, out T? cached) && cached is not null)
            return cached;

        var value = await factory();
        var ttl = expiration ?? TimeSpan.FromMinutes(_options.DefaultTtlMinutes);
        _cache.Set(key, value, ttl);
        return value;
    }
}
