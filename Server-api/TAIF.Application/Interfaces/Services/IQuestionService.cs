using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface IQuestionService : IService<Question>
{
    Task<List<Question>> GetByLessonItemIdAsync(Guid lessonItemId);
    Task<Question> CreateAndAssignToLessonItemAsync(Question question, Guid lessonItemId);
    Task<List<Question>> CreateBulkAndAssignToLessonItemAsync(List<Question> questions, Guid lessonItemId);
}
