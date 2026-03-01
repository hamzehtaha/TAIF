using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Requests;
using TAIF.Domain.Entities;
using TAIF.Domain.Interfaces;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Interfaces.Services
{
    public interface IContentService : IService<Content>
    {
        Task<Content> CreateQuizContentAsync(QuizCreateDto quizDto, Guid organizationId);
        Task<Content> UpdateQuizContentAsync(Guid contentId, QuizCreateDto quizDto);
        
        Task<Content> CreateAsync(CreateContentRequest request, Guid organizationId);
        Task<Content> UpdateAsync(Guid contentId, CreateContentRequest request);
    }
}
