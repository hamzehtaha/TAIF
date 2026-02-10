using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class InstructorProfileService : ServiceBase<InstructorProfile>, IInstructorProfileService
    {
        private readonly IInstructorProfileRepository _repository;
        private readonly IOrganizationService _organizationService;
        private readonly IUserService _userService;

        public InstructorProfileService(
            IInstructorProfileRepository repository,
            IOrganizationService organizationService,
            IUserService userService) : base(repository)
        {
            _repository = repository;
            _organizationService = organizationService;
            _userService = userService;
        }

        public async Task<InstructorProfile> CreateWithAutoOrgAsync(InstructorProfile entity)
        {
            // If no OrganizationId provided, assign random public organization
            if (entity.OrganizationId == null)
            {
                var publicOrgs = await _organizationService.GetAllPublicAsync();
                
                if (publicOrgs != null && publicOrgs.Count > 0)
                {
                    // Randomly select one public organization
                    var randomOrg = publicOrgs[new Random().Next(publicOrgs.Count)];
                    entity.OrganizationId = randomOrg.Id;
                }
            }

            // Add instructor profile
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // Mark user as instructor completed profile
            var updateUserDto = new { IsCompleted = true };
            await _userService.UpdateAsync(entity.UserId, updateUserDto);

            return entity;
        }
    }
}