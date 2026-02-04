using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class TagService : ServiceBase<Tag>, ITagService
    {
        public TagService(ITagRepository repository) : base(repository)
        {
        }

        public async Task<bool> TagsValidationGuard(List<Guid> tags)
        {
            HashSet<Guid> idsSet = new HashSet<Guid>(tags);
            var validTags = await _repository.FindNoTrackingAsync(e => idsSet.Contains(e.Id));
            if (validTags == null || !validTags.Any())
            {
                throw new Exception("Please Select Vaild Tags");
            }
            var existingIds = validTags.Select(o => o.Id).ToList();
            bool allExist = idsSet.All(id => existingIds.Contains(id));
            if (!allExist)
            {
                throw new Exception("Please Select Vaild Tags");
            }
            return true;
        }
    }
}
