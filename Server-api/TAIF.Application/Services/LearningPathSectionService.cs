using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class LearningPathSectionService : ServiceBase<LearningPathSection>, ILearningPathSectionService
    {
        public LearningPathSectionService(ILearningPathSectionRepository repository) : base(repository)
        {
        }
    }
}