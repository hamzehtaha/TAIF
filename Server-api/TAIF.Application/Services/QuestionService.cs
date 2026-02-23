using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services;

public class QuestionService : ServiceBase<Question>, IQuestionService
{
    private readonly IQuestionRepository _questionRepository;

    public QuestionService(IQuestionRepository repository) : base(repository)
    {
        _questionRepository = repository;
    }

    public async Task<List<Question>> GetByLessonItemIdAsync(Guid lessonItemId)
    {
        return await _questionRepository.GetByLessonItemIdAsync(lessonItemId);
    }

    public async Task<Question> CreateAndAssignToLessonItemAsync(Question question, Guid lessonItemId)
    {
        question.LessonItemId = lessonItemId;
        
        // Auto-assign order if not set
        if (question.Order == 0)
        {
            question.Order = (await _questionRepository.GetMaxOrderForLessonItemAsync(lessonItemId)) + 1;
        }
        
        await _questionRepository.AddAsync(question);
        await _questionRepository.SaveChangesAsync();
        return question;
    }

    public async Task<List<Question>> CreateBulkAndAssignToLessonItemAsync(List<Question> questions, Guid lessonItemId)
    {
        var currentMaxOrder = await _questionRepository.GetMaxOrderForLessonItemAsync(lessonItemId);
        
        foreach (var question in questions)
        {
            question.LessonItemId = lessonItemId;
            if (question.Order == 0)
            {
                currentMaxOrder++;
                question.Order = currentMaxOrder;
            }
            await _questionRepository.AddAsync(question);
        }
        
        await _questionRepository.SaveChangesAsync();
        return questions;
    }
}
