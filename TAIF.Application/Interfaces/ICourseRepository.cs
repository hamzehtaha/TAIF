using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ICourseRepository
    {
        Task<List<Course>> GetAllAsync();
        Task<Course?> GetByIdAsync(int id);
        Task<Course> CreateAsync(Course course);
        Task<bool> UpdateAsync(Course course);
        Task<bool> DeleteAsync(int id);
    }
}