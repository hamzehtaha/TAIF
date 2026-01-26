using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces
{
    public interface ICourseService : IService<Course>
    {
        public Task<bool> UpdateAsync(Course dto);
    }
}
