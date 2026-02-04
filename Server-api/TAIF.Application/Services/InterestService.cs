using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class InterestService : ServiceBase<Interest>, IInterestService
    {
        public InterestService(IInterestRepository repository) : base(repository)
        {
        }

        public async Task<bool> InterestsValidationGuard(List<Guid> interests)
        {
            HashSet<Guid> idsSet = new HashSet<Guid>(interests);
            var validTags = await _repository.FindNoTrackingAsync(e => idsSet.Contains(e.Id));
            if (validTags == null || !validTags.Any())
            {
                throw new Exception("Please Select Vaild Interests");
            }
            var existingIds = validTags.Select(o => o.Id).ToList();
            bool allExist = idsSet.All(id => existingIds.Contains(id));
            if (!allExist)
            {
                throw new Exception("Please Select Vaild Interests");
            }
            return true;
        }
    }
}
