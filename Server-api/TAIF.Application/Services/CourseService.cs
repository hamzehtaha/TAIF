using System.Linq.Expressions;
using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class CourseService : ServiceBase<Course> , ICourseService
    {
        public CourseService(ICourseRepository repository):base(repository)
        {
            
        }
        public async Task<bool> UpdateAsync(Course dto)
        {
            Course course = new Course
            {
                Id = dto.Id,
            };
            var updatedProperties = new List<Expression<Func<Course, object>>>();

            if (!String.IsNullOrEmpty(dto.Name))
            {
                course.Name = dto.Name;
                updatedProperties.Add(c => c.Name ?? String.Empty);
            }

            if (!String.IsNullOrEmpty(dto.Description))
            {
                course.Description = dto.Description;
                updatedProperties.Add(c => c.Description ?? String.Empty);
            }

            if (!String.IsNullOrEmpty(dto.Photo))
            {
                course.Photo = dto.Photo;
                updatedProperties.Add(c => c.Photo ?? String.Empty);
            }

            _repository.Update(course, updatedProperties.ToArray());
            var number_Of_updated = await _repository.SaveChangesAsync();
            return number_Of_updated > 0;
        }

    }
}