using System.Text.Json;
using TAIF.Application.DTOs.Payloads;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class LessonItemService : ServiceBase<LessonItem>, ILessonItemService
    {
        private readonly ILessonItemRepository _lessonItemRepository;
        public LessonItemService(ILessonItemRepository repository) : base(repository)
        {
            _lessonItemRepository = repository;
        }
        public async Task<List<LessonItemResponse>> GetByLessonIdAsync(Guid lessonId, bool withDeleted = false)
        {
            var lessonsItem =  await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            List<LessonItemResponse> lessonItemsResponse = lessonsItem
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    Content = SanitizeContent(li),
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                }).ToList();
            return lessonItemsResponse;
        }

        internal static object SanitizeContent(LessonItem item)
        {
            if (item.Type != LessonItemType.Question)
            {
                return JsonSerializer.Deserialize<object>(item.Content)!;
            }
            using var doc = JsonDocument.Parse(item.Content);
            var root = doc.RootElement;

            var sanitizedQuestions = root
                .GetProperty("questions")
                .EnumerateArray()
                .Select(q => new
                {
                    id = q.GetProperty("id").GetString(),
                    text = q.GetProperty("text").GetString(),
                    options = q.GetProperty("options")
                               .EnumerateArray()
                               .Select(o => o.GetString())
                               .ToList()
                })
                .ToList();

            return new
            {
                questions = sanitizedQuestions
            };
        }
    }
}