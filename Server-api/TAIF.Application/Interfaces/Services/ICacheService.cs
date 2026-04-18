namespace TAIF.Application.Interfaces.Services;

/// <summary>
/// Cache abstraction layer. Currently backed by in-memory cache.
/// Replace implementation with Redis, distributed cache, etc. without changing consumers.
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);

    /// <summary>
    /// Gets value from cache or creates it using the factory, then caches the result.
    /// </summary>
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
}
