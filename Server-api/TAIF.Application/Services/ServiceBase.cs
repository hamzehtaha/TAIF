using System.Linq.Expressions;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class ServiceBase<T> : IService<T> where T : Base
    {
        protected readonly IRepository<T> _repository;
        public ServiceBase(IRepository<T> repository)
        {
            _repository = repository;
        }
        public virtual async Task<List<T>> GetAllAsync(bool withDeleted = false)
        {
            return await _repository.GetAllAsync(withDeleted);
        }
        public virtual async Task<PagedResult<T>> GetPagedAsync(BaseFilter filter,Expression<Func<T, bool>>? predicate = null,Expression<Func<T, object>>? orderBy = null,bool orderByDescending = true,bool withDeleted = false,params Expression<Func<T, object>>[] includes)
        {
            if (filter.Page <= 0)
                throw new ArgumentException("Page must be greater than zero");

            if (filter.PageSize <= 0)
                throw new ArgumentException("PageSize must be greater than zero");

            return await _repository.GetPagedAsync(
                page: filter.Page,
                pageSize: filter.PageSize,
                filter: predicate,
                orderBy: orderBy,
                orderByDescending: orderByDescending,
                withDeleted: withDeleted,
                includes: includes
            );
        }
        public virtual async Task<T?> GetByIdAsync(Guid id, bool withDeleted = false)
        {
            return await _repository.GetByIdAsync(id, withDeleted);
        }
        public virtual async Task<T> CreateAsync(T entity)
        {
            await _repository.AddAsync(entity);
            var number_Of_added = await _repository.SaveChangesAsync();
            if (number_Of_added > 0)
            {
                return entity;
            }
            throw new Exception("No entity Created");
        }
        public virtual async Task<bool> DeleteAsync(Guid id)
        {
            T? entity = await _repository.GetByIdAsync(id);
            if (entity is null)
            {
                return false;
            }
            _repository.SoftDelete(entity);
            var number_Of_deleted = await _repository.SaveChangesAsync();
            return number_Of_deleted > 0;
        }
        public virtual async Task<bool> PermanentDeleteAsync(Guid id)
        {
            T? entity = await _repository.GetByIdAsync(id, withDeleted: true);
            if (entity is null)
            {
                return false;
            }
            _repository.PermanentDelete(entity);
            var number_Of_deleted = await _repository.SaveChangesAsync();
            return number_Of_deleted > 0;
        }
        public virtual async Task<bool> RestoreAsync(Guid id)
        {
            T? entity = await _repository.GetByIdAsync(id, withDeleted: true);
            if (entity is null)
            {
                return false;
            }
            if (!entity.IsDeleted)
            {
                return false;
            }
            _repository.Restore(entity);
            var number_Of_restored = await _repository.SaveChangesAsync();
            return number_Of_restored > 0;
        }
        public virtual async Task<T> UpdateAsync(Guid id, object updateDto)
        {
            if (updateDto == null)
                throw new ArgumentNullException(nameof(updateDto));

            var existingEntity = await _repository.GetByIdAsync(id);
            if (existingEntity == null)
                throw new Exception($"Entity with id {id} not found");

            var dtoProperties = updateDto.GetType().GetProperties()
                .Where(p => p.CanRead)
                .ToDictionary(p => p.Name, p => p);

            var entityProperties = typeof(T).GetProperties()
                .Where(p => p.CanWrite && p.GetSetMethod() != null && p.Name != "Id")
                .ToList();

            var matchedProperties = new List<Expression<Func<T, object>>>();

            foreach (var entityProp in entityProperties)
            {
                if (dtoProperties.TryGetValue(entityProp.Name, out var dtoProp))
                {
                    var dtoValue = dtoProp.GetValue(updateDto);
                    
                    if (dtoValue != null)
                    {
                        entityProp.SetValue(existingEntity, dtoValue);

                        var parameter = Expression.Parameter(typeof(T), "x");
                        var property = Expression.Property(parameter, entityProp);
                        var converted = Expression.Convert(property, typeof(object));
                        matchedProperties.Add(Expression.Lambda<Func<T, object>>(converted, parameter));
                    }
                }
            }

            if (matchedProperties.Count == 0)
                throw new Exception("No matching properties found to update");

            _repository.Update(existingEntity, matchedProperties.ToArray());
            var number_Of_updated = await _repository.SaveChangesAsync();
            if (number_Of_updated > 0)
            {
                return existingEntity;
            }
            throw new Exception("No entity Updated");
        }

        public async Task<List<T>> FindNoTrackingAsync(Expression<Func<T, bool>> predicate, bool withDeleted = false, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = false)
        {
            return await _repository.FindNoTrackingAsync(predicate, withDeleted, orderBy, orderByDescending);
        }
    }
}
