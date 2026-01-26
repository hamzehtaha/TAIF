using System.Linq.Expressions;

namespace TAIF.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id,bool withDeleted = false);
    Task<T?> GetByIdNoTrackingAsync(Guid id, bool withDeleted = false);
    Task<List<T>> GetAllAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false);
    Task<List<T>> GetAllNoTrackingAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false);
    Task<T> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<T> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false);
    Task<List<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<List<T>> FindWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<List<T>> GetAllNoTrackingWithIncludeAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task AddAsync(T entity);
    void Update(T entity, params Expression<Func<T, object>>[] updatedProperties);
    void Remove(T entity);
    void Restore(T entity);
    Task<int> SaveChangesAsync();

}
