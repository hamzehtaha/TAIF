using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs.Responses;

namespace TAIF.Application.Interfaces.Services
{
    public interface IUserPlanService
    {
        Task<UserLearningPlanResponse> GeneratePlanAsync(Guid userId, Guid OrganizationId);
    }
}
