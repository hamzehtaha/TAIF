using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Repositories;

public interface IQuestionRepository : IRepository<Question>
{
    Task<List<Question>> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<int> GetMaxOrderForLessonItemAsync(Guid lessonItemId);
}
