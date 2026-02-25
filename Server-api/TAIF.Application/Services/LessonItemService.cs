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
            var lessonsItem = await _lessonItemRepository.GetByLessonIdAsync(lessonId, withDeleted);
            List<LessonItemResponse> lessonItemsResponse = lessonsItem
                .Select(li => new LessonItemResponse
                {
                    Id = li.Id,
                    Name = li.Name,
                    Description = li.Description,
                    ContentId = li.ContentId,
                    Content = li.Content != null ? GetContentData(li.Content) : null,
                    Type = li.Type,
                    DurationInSeconds = li.DurationInSeconds,
                    CreatedAt = li.CreatedAt,
                    UpdatedAt = li.UpdatedAt,
                }).ToList();
            return lessonItemsResponse;
        }

        private static object? GetContentData(Content content)
        {
            if (content == null || string.IsNullOrEmpty(content.ContentJson))
                return null;

            try
            {
                return JsonSerializer.Deserialize<object>(content.ContentJson);
            }
            catch
            {
                return null;
            }
        }
    }
}