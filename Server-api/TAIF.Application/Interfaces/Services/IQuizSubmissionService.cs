using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IQuizSubmissionService : IService<QuizSubmission>
    {
        Task<QuizSubmission?> GetUserSubmissionAsync(Guid userId, Guid lessonItemId);
    }
}
