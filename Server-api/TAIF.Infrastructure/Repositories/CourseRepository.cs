using Microsoft.EntityFrameworkCore;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;
using TAIF.Application.Interfaces;
using TipMe_api.Repositories;

namespace TAIF.Infrastructure.Repositories
{
    public class CourseRepository : RepositoryBase<Course>, ICourseRepository
    {
        private readonly TaifDbContext _context;

        public CourseRepository(TaifDbContext context):base(context)
        {
            _context = context;
        }
    }
}