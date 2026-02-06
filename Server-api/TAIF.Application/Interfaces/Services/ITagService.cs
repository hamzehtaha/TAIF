using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services
{
    public interface ITagService : IService<Tag>
    {
        Task<bool> TagsValidationGuard(List<Guid> tags);
    }
}
