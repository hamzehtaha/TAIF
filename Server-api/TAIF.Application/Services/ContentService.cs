using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using TAIF.Domain.Interfaces;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class ContentService : ServiceBase<Content>, IContentService
    {
        private readonly IContentRepository _repository;

        public ContentService(IContentRepository repository) : base(repository)
        {
            _repository = repository;
        }
        public async Task<Content> CreateAsync(CreateContentRequest request, Guid? organizationId = null)
        {
            IContentData data = request.Type switch
            {
                LessonItemType.Video => request.Video ?? throw new ArgumentNullException(nameof(request.Video), "Video data is required"),
                LessonItemType.RichText => request.RichText ?? throw new ArgumentNullException(nameof(request.RichText), "RichText data is required"),
                LessonItemType.Quiz => request.Quiz ?? throw new ArgumentNullException(nameof(request.Quiz), "Quiz data is required"),
                _ => throw new Exception("Unsupported content type")
            };
            var content = new Content(request.Type, data);
            content.OrganizationId = organizationId;
            await _repository.AddAsync(content);
            await _repository.SaveChangesAsync();
            return content;
        }

        public async Task<Content> UpdateAsync(Guid id, CreateContentRequest request)
        {
            var content = await _repository.GetByIdAsync(id);
            if (content == null)
                throw new Exception("Content not found");

            IContentData data = request.Type switch
            {
                LessonItemType.Video => request.Video ?? throw new ArgumentNullException(nameof(request.Video), "Video data is required"),
                LessonItemType.RichText => request.RichText ?? throw new ArgumentNullException(nameof(request.RichText), "RichText data is required"),
                LessonItemType.Quiz => request.Quiz ?? throw new ArgumentNullException(nameof(request.Quiz), "Quiz data is required"),
                _ => throw new Exception("Unsupported content type")
            };

            content.ContentData = data;
            _repository.Update(content , c => c.ContentJson);
            await _repository.SaveChangesAsync();
            return content;
        }
    }
}
