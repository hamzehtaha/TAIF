using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Responses;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IEvaluationQuestionService : IService<EvaluationQuestion>
    {
        Task<List<EvaluationQuestionResponseDto>> GetAllWithAnswersAsync();
    }
}
