using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class QuizSubmissionService: ServiceBase<QuizSubmission>, IQuizSubmissionService
    {
        private readonly IQuizSubmissionRepository _repository;
        public QuizSubmissionService(IQuizSubmissionRepository repository) : base(repository)
        {
            _repository = repository;
        }
        public async Task<QuizSubmission?> GetUserSubmissionAsync(Guid userId,Guid lessonItemId)
        {
            return await _repository.GetByUserAndLessonItemAsync(userId, lessonItemId);
        }
    }
}
