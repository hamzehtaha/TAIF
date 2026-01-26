using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TAIF.Application.Interfaces;

namespace TipMe_api.Repositories
{
    public class RepositoryBase<T> : IRepository<T> where T : class
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
                return await _dbSet.FindAsync(id);
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
                // Assumes the entity has a Guid Id property
                return await _dbSet.AsNoTracking()
                    .FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error fetching (no tracking) entity of type {typeof(T).Name} by Id.", ex);
            }
        }
        public virtual async Task<List<T>> GetAllAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false)
        {
            try
            {
                IQueryable<T> query = _dbSet;
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
        public virtual async Task<List<T>> GetAllNoTrackingWithIncludeAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            try
            {
                if (includes == null)
                    throw new ArgumentNullException(nameof(includes));

                IQueryable<T> query = _dbSet;
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
        public virtual async Task<List<T>> GetAllNoTrackingAsync(Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false)
        {
            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking();
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
        public virtual async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet.Where(predicate);

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
        public virtual async Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking().Where(predicate);

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
        public async Task<T> FindOneAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                return await _dbSet.Where(predicate).SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding entities of type {typeof(T).Name}.", ex);
            }
        }
        public async Task<T> FindOneNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                return await _dbSet.AsNoTracking().Where(predicate).SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error finding (no tracking) entities of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<List<T>> FindWithIncludesAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));
            if (includes == null)
                throw new ArgumentNullException(nameof(includes));

            try
            {
                IQueryable<T> query = _dbSet.Where(predicate);
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
                throw new RepositoryException($"Error finding entities with includes of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<List<T>> FindWithIncludesNoTrackingAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false, params Expression<Func<T, object>>[] includes)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));
            if (includes == null)
                throw new ArgumentNullException(nameof(includes));

            try
            {
                IQueryable<T> query = _dbSet.AsNoTracking().Where(predicate);
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
                throw new RepositoryException($"Error finding (no tracking) entities with includes of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task AddAsync(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
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
                _dbSet.Attach(entity);
                var entry = _context.Entry(entity);

                foreach (var property in updatedProperties)
                {
                    entry.Property(property).IsModified = true;
                }
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error updating entity of type {typeof(T).Name}.", ex);
            }
        }
        public virtual void Remove(T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            try
            {
                _dbSet.Remove(entity);
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error removing entity of type {typeof(T).Name}.", ex);
            }
        }
        public virtual async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false)
        {
            if (predicate == null)
                throw new ArgumentNullException(nameof(predicate));

            try
            {
                return await _dbSet.AnyAsync(predicate);
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
                
            }
            catch (Exception ex)
            {
                throw new RepositoryException($"Error removing entity of type {typeof(T).Name}.", ex);
            }
        }
    }
    public class RepositoryException : Exception
    {
        public RepositoryException() { }
        public RepositoryException(string message) : base(message) { }
        public RepositoryException(string message, Exception innerException) : base(message, innerException) { }
    }
}
