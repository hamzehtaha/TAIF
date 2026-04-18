using System.Linq.Expressions;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface IRepository<T> where T : Base
{
    // Single entity retrieval
    Task<T?> GetByIdAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> GetByIdNoTrackingAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> GetByIdWithIncludesAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
    Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> FindOneWithIncludesAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
    Task<T?> FindOneWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);

    // Collection retrieval
    Task<List<T>> GetAllAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default);
    Task<List<T>> GetAllNoTrackingAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default);
    Task<List<T>> GetAllNoTrackingWithIncludeAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false, bool asNoTracking = true, params Expression<Func<T, object>>[] includes);

    // Find methods
    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default);
    Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default);
    Task<List<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<List<T>> FindWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);

    // Existence & counting
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default);

    // Aggregation
    Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<decimal> AverageAsync(Expression<Func<T, decimal>> selector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> MinByAsync(Expression<Func<T, object>> keySelector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default);
    Task<T?> MaxByAsync(Expression<Func<T, object>> keySelector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default);

    // Bulk operations
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    void SoftDeleteRange(IEnumerable<T> entities);
    void PermanentDeleteRange(IEnumerable<T> entities);

    // Raw SQL & stored procedures
    Task<List<T>> FromSqlRawAsync(string sql, CancellationToken cancellationToken = default, params object[] parameters);
    Task<int> ExecuteSqlRawAsync(string sql, CancellationToken cancellationToken = default, params object[] parameters);
    Task<int> ExecuteSqlInterpolatedAsync(FormattableString sql, CancellationToken cancellationToken = default);

    // CRUD
    Task AddAsync(T entity);
    void Update(T entity, params Expression<Func<T, object>>[] updatedProperties);
    void SoftDelete(T entity);
    void PermanentDelete(T entity);
    void Restore(T entity);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    // Transaction support
    Task<IDisposable> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
