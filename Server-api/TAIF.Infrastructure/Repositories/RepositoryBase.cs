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
        public virtual async Task<T?> GetByIdAsync(Guid id, bool withDeleted = false)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                return await query.FirstOrDefaultAsync(e => e.Id == id);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching entity of type {typeof(T).Name} by Id.", ex);
            }
        }
        public virtual async Task<T?> GetByIdNoTrackingAsync(Guid id, bool withDeleted = false)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id cannot be empty Guid.", nameof(id));

            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                return await query.FirstOrDefaultAsync(e => e.Id == id);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching (no tracking) entity of type {typeof(T).Name} by Id.", ex);
            }
        }
        public virtual async Task<List<T>> GetAllAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false)
        {
            try
            {
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                var sql = query.ToQueryString();
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<PagedResult<T>> GetPagedAsync(int page,int pageSize,Expression<Func<T, bool>>? filter = null,Expression<Func<T, object>>? orderBy = null,bool orderByDescending = false,bool withDeleted = false,bool asNoTracking = true,params Expression<Func<T, object>>[] includes)
        {
            if (page <= 0)
                throw new ArgumentException("Page must be greater than zero.", nameof(page));

            if (pageSize <= 0)
                throw new ArgumentException("PageSize must be greater than zero.", nameof(pageSize));

            try
            {
                IQueryable<T> query = asNoTracking
                    ? _dbSet.AsNoTracking()
                    : _dbSet.AsQueryable();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                if (filter != null)
                    query = query.Where(filter);
                if (includes != null && includes.Length > 0)
                {
                    foreach (var include in includes)
                        query = query.Include(include);
                }
                var totalCount = await query.CountAsync();
                if (orderBy != null)
                {
                    query = orderByDescending
                        ? query.OrderByDescending(orderBy)
                        : query.OrderBy(orderBy);
                }
                else
                {
                    query = query.OrderByDescending(e => e.CreatedAt);
                }
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
                throw new RepositoryException($"Error fetching paged entities of type {typeof(T).Name}.",ex);
            }
        }
        public virtual async Task<List<T>> GetAllNoTrackingWithIncludeAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            try
            {
                if (includes == null)
                    throw new ArgumentNullException(nameof(includes));

                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<List<T>> GetAllNoTrackingAsync(bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false)
        {
            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching all (no tracking) entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                query = query.Where(predicate);

                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                query = query.Where(predicate);

                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<T> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                return await query.Where(predicate).SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<T> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                return await query.Where(predicate).SingleOrDefaultAsync();
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
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                query = query.Where(predicate);
                
                if (includes != null && includes.Length > 0)
                {
                    foreach (var include in includes)
                    {
                        query = query.Include(include);
                    }
                }

                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
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
                IQueryable<T> query = _dbSet.AsNoTracking();
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                query = query.Where(predicate);
                
                if (includes != null && includes.Length > 0)
                {
                    foreach (var include in includes)
                    {
                        query = query.Include(include);
                    }
                }
                
                if (orderBy != null)
                {
                    query = orderByDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entities with includes of type {typeof(T).Name}.", ex);
            }
        }
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
                {
                    entry.Property(property).IsModified = true;
                }
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
        public virtual async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet;
                if (!withDeleted)
                    query = query.Where(e => !e.IsDeleted);
                
                return await query.AnyAsync(predicate);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual void Restore(T entity)
        {
            if(entity == null)
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
    }
    public class RepositoryException : Exception
    {
        public RepositoryException(string message, Exception innerException) : base(message, innerException) { }
    }
}
