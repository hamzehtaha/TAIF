using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ICourseService : IService<Course>
    {
        Task<List<Course>> GetByCategoryIdAsync(Guid categoryId);
        Task<List<Course>> GetRecommendedCoursesAsync(Guid userId, int count = 10);
        Task<List<Course>> GetByUserIdAsync(Guid userId);
        Task<List<Guid>> GetCourseIdsByUserAsync(Guid userId);
        
        /// <summary>
        /// Creates a complete course with all lessons, lesson items, and content in a single transaction.
        /// </summary>
        Task<CreateFullCourseResponse> CreateFullCourseAsync(CreateFullCourseRequest request, Guid creatorId);
    }
}
