using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;

namespace TAIF.Infrastructure.Repositories
{
    public class RepositoryBase<T> : IRepository<T> where T : Base
    {
        protected readonly DbContext _context;
        protected readonly DbSet<T> _dbSet;

        public RepositoryBase(DbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
        }

        #region Helpers

        protected IQueryable<T> ApplySoftDeleteFilter(IQueryable<T> query, bool withDeleted)
        {
            return withDeleted ? query : query.Where(e => !e.IsDeleted);
        }

        protected IQueryable<T> ApplyOrdering(IQueryable<T> query, Expression<Func<T, object>>? orderBy, bool orderByDescending)
        {
            if (orderBy != null)
                return orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
            return query;
        }

        protected IQueryable<T> ApplyIncludes(IQueryable<T> query, Expression<Func<T, object>>[]? includes)
        {
            if (includes != null && includes.Length > 0)
            {
                foreach (var include in includes)
                    query = query.Include(include);
            }
            return query;
        }

        #endregion

        #region Single Entity Retrieval

        public virtual async Task<T?> GetByIdAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching entity of type {typeof(T).Name} by Id.", ex);
            }
        }

        public virtual async Task<T?> GetByIdNoTrackingAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching (no tracking) entity of type {typeof(T).Name} by Id.", ex);
            }
        }

        public virtual async Task<T?> GetByIdWithIncludesAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                query = ApplyIncludes(query, includes);
                return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching entity of type {typeof(T).Name} by Id with includes.", ex);
            }
        }

        public virtual async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                return await query.FirstOrDefaultAsync(predicate, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<T?> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                return await query.FirstOrDefaultAsync(predicate, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<T?> FindOneWithIncludesAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                query = ApplyIncludes(query, includes);
                return await query.FirstOrDefaultAsync(predicate, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entity with includes of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<T?> FindOneWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                query = ApplyIncludes(query, includes);
                return await query.FirstOrDefaultAsync(predicate, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entity with includes of type {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Collection Retrieval

        public virtual async Task<List<T>> GetAllAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<List<T>> GetAllNoTrackingAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all (no tracking) entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<List<T>> GetAllNoTrackingWithIncludeAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            try
            {
                if (includes == null)
                    throw new ArgumentNullException(nameof(includes));

                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                query = ApplyIncludes(query, includes);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<PagedResult<T>> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false, bool asNoTracking = true, params Expression<Func<T, object>>[] includes)
        {
            if (page <= 0)
                throw new ArgumentException("Page must be greater than zero.", nameof(page));
            if (pageSize <= 0)
                throw new ArgumentException("PageSize must be greater than zero.", nameof(pageSize));

            try
            {
                IQueryable<T> query = asNoTracking ? _dbSet.AsNoTracking() : _dbSet.AsQueryable();
                query = ApplySoftDeleteFilter(query, withDeleted);

                if (filter != null)
                    query = query.Where(filter);

                query = ApplyIncludes(query, includes);

                var totalCount = await query.CountAsync();

                query = orderBy != null
                    ? ApplyOrdering(query, orderBy, orderByDescending)
                    : query.OrderByDescending(e => e.CreatedAt);

                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResult<T>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching paged entities of type {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Find Methods

        public virtual async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted).Where(predicate);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, CancellationToken cancellationToken = default)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted).Where(predicate);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<List<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted).Where(predicate);
                query = ApplyIncludes(query, includes);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities with includes of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<List<T>> FindWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted).Where(predicate);
                query = ApplyIncludes(query, includes);
                query = ApplyOrdering(query, orderBy, orderByDescending);
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entities with includes of type {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Existence & Counting

        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet, withDeleted);
                return await query.AnyAsync(predicate, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error checking existence of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<bool> ExistsAsync(Guid id, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                return await query.AnyAsync(e => e.Id == id, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error checking existence of {typeof(T).Name} by Id.", ex);
            }
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                return predicate != null
                    ? await query.CountAsync(predicate, cancellationToken)
                    : await query.CountAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error counting entities of type {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Aggregation

        public virtual async Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (selector == null)
                throw new ArgumentNullException(nameof(selector));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                if (predicate != null)
                    query = query.Where(predicate);
                return await query.SumAsync(selector, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error computing sum for {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<decimal> AverageAsync(Expression<Func<T, decimal>> selector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (selector == null)
                throw new ArgumentNullException(nameof(selector));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                if (predicate != null)
                    query = query.Where(predicate);

                if (!await query.AnyAsync(cancellationToken))
                    return 0;

                return await query.AverageAsync(selector, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error computing average for {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<T?> MinByAsync(Expression<Func<T, object>> keySelector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (keySelector == null)
                throw new ArgumentNullException(nameof(keySelector));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                if (predicate != null)
                    query = query.Where(predicate);
                return await query.OrderBy(keySelector).FirstOrDefaultAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error computing min for {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<T?> MaxByAsync(Expression<Func<T, object>> keySelector, Expression<Func<T, bool>>? predicate = null, bool withDeleted = false, CancellationToken cancellationToken = default)
        {
            if (keySelector == null)
                throw new ArgumentNullException(nameof(keySelector));

            try
            {
                var query = ApplySoftDeleteFilter(_dbSet.AsNoTracking(), withDeleted);
                if (predicate != null)
                    query = query.Where(predicate);
                return await query.OrderByDescending(keySelector).FirstOrDefaultAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error computing max for {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Bulk Operations

        public virtual async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
        {
            if (entities == null)
                throw new ArgumentNullException(nameof(entities));

            try
            {
                var entityList = entities.ToList();
                var now = DateTime.UtcNow;
                foreach (var entity in entityList)
                    entity.CreatedAt = now;

                await _dbSet.AddRangeAsync(entityList, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error adding range of entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void SoftDeleteRange(IEnumerable<T> entities)
        {
            if (entities == null)
                throw new ArgumentNullException(nameof(entities));

            try
            {
                var now = DateTime.UtcNow;
                foreach (var entity in entities)
                {
                    entity.IsDeleted = true;
                    entity.DeletedAt = now;
                    entity.UpdatedAt = now;
                    _dbSet.Attach(entity);
                    var entry = _context.Entry(entity);
                    entry.Property(e => e.IsDeleted).IsModified = true;
                    entry.Property(e => e.DeletedAt).IsModified = true;
                    entry.Property(e => e.UpdatedAt).IsModified = true;
                }
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error soft deleting range of entities of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void PermanentDeleteRange(IEnumerable<T> entities)
        {
            if (entities == null)
                throw new ArgumentNullException(nameof(entities));

            try
            {
                _dbSet.RemoveRange(entities);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error permanently deleting range of entities of type {typeof(T).Name}.", ex);
            }
        }

        #endregion

        #region Raw SQL & Stored Procedures

        public virtual async Task<List<T>> FromSqlRawAsync(string sql, CancellationToken cancellationToken = default, params object[] parameters)
        {
            if (string.IsNullOrWhiteSpace(sql))
                throw new ArgumentException("SQL query cannot be null or empty.", nameof(sql));

            try
            {
                return await _dbSet.FromSqlRaw(sql, parameters).ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error executing raw SQL for {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<int> ExecuteSqlRawAsync(string sql, CancellationToken cancellationToken = default, params object[] parameters)
        {
            if (string.IsNullOrWhiteSpace(sql))
                throw new ArgumentException("SQL command cannot be null or empty.", nameof(sql));

            try
            {
                return await _context.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error executing raw SQL command.", ex);
            }
        }

        public virtual async Task<int> ExecuteSqlInterpolatedAsync(FormattableString sql, CancellationToken cancellationToken = default)
        {
            if (sql == null)
                throw new ArgumentNullException(nameof(sql));

            try
            {
                return await _context.Database.ExecuteSqlInterpolatedAsync(sql, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error executing interpolated SQL command.", ex);
            }
        }

        #endregion

        #region CRUD

        public virtual async Task AddAsync(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
                entity.CreatedAt = DateTime.UtcNow;
                await _dbSet.AddAsync(entity);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error adding entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void Update(T entity, params Expression<Func<T, object>>[] updatedProperties)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            if (updatedProperties == null || updatedProperties.Length == 0)
                throw new ArgumentException("At least one property must be specified for update.", nameof(updatedProperties));

            try
            {
                entity.UpdatedAt = DateTime.UtcNow;
                _dbSet.Attach(entity);
                var entry = _context.Entry(entity);

                foreach (var property in updatedProperties)
                    entry.Property(property).IsModified = true;

                entry.Property(e => e.UpdatedAt).IsModified = true;
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error updating entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void SoftDelete(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
                entity.IsDeleted = true;
                entity.DeletedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;
                _dbSet.Attach(entity);
                var entry = _context.Entry(entity);
                entry.Property(e => e.IsDeleted).IsModified = true;
                entry.Property(e => e.DeletedAt).IsModified = true;
                entry.Property(e => e.UpdatedAt).IsModified = true;
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error soft deleting entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void PermanentDelete(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
                _dbSet.Remove(entity);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error permanently deleting entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual void Restore(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
                entity.IsDeleted = false;
                _dbSet.Attach(entity);
                _context.Entry(entity).Property(e => e.IsDeleted).IsModified = true;
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error restoring entity of type {typeof(T).Name}.", ex);
            }
        }

        public virtual async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        #endregion
    }

    public class RepositoryException : Exception
    {
        public RepositoryException(string message, Exception innerException) : base(message, innerException) { }
    }
}
