using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Filters;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IService<T> where T : Base
    {
        public Task<List<T>> GetAllAsync(bool withDeleted = false);
        Task<PagedResult<T>> GetPagedAsync(BaseFilter filter, Expression<Func<T, bool>>? predicate = null, Expression<Func<T, object>>? orderBy = null, bool orderByDescending = true, bool withDeleted = false, params Expression<Func<T, object>>[] includes);
        public Task<T?> GetByIdAsync(Guid id, bool withDeleted = false);
        public Task<T> CreateAsync(T entity);
        public Task<T> UpdateAsync(Guid id, object updateDto);
        public Task<bool> DeleteAsync(Guid id);
        public Task<bool> PermanentDeleteAsync(Guid id);
        public Task<bool> RestoreAsync(Guid id);
    }
}
