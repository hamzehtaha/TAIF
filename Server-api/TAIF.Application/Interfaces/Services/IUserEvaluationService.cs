using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Requests;
using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface IUserEvaluationService : IService<UserEvaluation>
    {
        Task<bool> ExistsForUserAsync(Guid userId);
        Task<UserEvaluation?> GetByUserIdAsync(Guid userId);
        Task<UserEvaluation> SubmitAsync(Guid userId, Guid organizationId, SubmitEvaluation dto);

    }
}
