using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface IService<T> where T : class
    {
        public Task<List<T>> GetAllAsync();
        public Task<T?> GetByIdAsync(Guid id);
        public Task<T> CreateAsync(T entity);
        public Task<bool> DeleteAsync(Guid id);
    }
}
