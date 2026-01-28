using System.Linq.Expressions;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface IRepository<T> where T : Base
{
    Task<T?> GetByIdAsync(Guid id, bool withDeleted = false);
    Task<T?> GetByIdNoTrackingAsync(Guid id, bool withDeleted = false);
    Task<List<T>> GetAllAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false);
    Task<List<T>> GetAllNoTrackingAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false);
    Task<T> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<T> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false);
    Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false);
    Task<List<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<List<T>> FindWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task<List<T>> GetAllNoTrackingWithIncludeAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes);
    Task AddAsync(T entity);
    void Update(T entity, params Expression<Func<T, object>>[] updatedProperties);
    void SoftDelete(T entity);
    void PermanentDelete(T entity);
    void Restore(T entity);
    Task<int> SaveChangesAsync();

}
