using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class ServiceBase<T> : IService<T> where T : class
    {
        protected readonly IRepository<T> _repository;
        public ServiceBase(IRepository<T> repository)
        {
            _repository = repository;
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
            T? entity = await _repository.GetByIdNoTrackingAsync(id);
            if (entity is null)
            {
                return false;
            }
            _repository.Remove(entity);
            var number_Of_deleted = await _repository.SaveChangesAsync();
            return number_Of_deleted > 0;
        }

        public virtual async Task<List<T>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public virtual async Task<T?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }
    }
}
