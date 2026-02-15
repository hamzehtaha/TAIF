using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
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

        public async Task<InstructorProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _repository.GetByUserIdAsync(userId);
        }

        public async Task<InstructorProfileResponse?> GetProfileByUserIdAsync(Guid userId)
        {
            var profile = await _repository.GetByUserIdWithUserAsync(userId);
            if (profile == null) return null;

            return MapToResponse(profile);
        }

        public async Task<InstructorProfileResponse?> UpdateProfileAsync(Guid userId, UpdateInstructorProfileRequest request)
        {
            var profile = await _repository.GetByUserIdWithUserAsync(userId);
            if (profile == null) return null;

            // Update User fields
            if (!string.IsNullOrEmpty(request.FirstName))
                profile.User.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName))
                profile.User.LastName = request.LastName;

            // Update InstructorProfile fields
            if (request.Bio != null)
                profile.Bio = request.Bio;
            if (request.Expertises != null)
                profile.Expertises = request.Expertises;
            if (request.YearsOfExperience.HasValue)
                profile.YearsOfExperience = request.YearsOfExperience.Value;

            profile.UpdatedAt = DateTime.UtcNow;
            profile.User.UpdatedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync();

            return MapToResponse(profile);
        }

        private InstructorProfileResponse MapToResponse(InstructorProfile profile)
        {
            return new InstructorProfileResponse
            {
                Id = profile.Id,
                UserId = profile.UserId,
                FirstName = profile.User.FirstName,
                LastName = profile.User.LastName,
                Email = profile.User.Email,
                Birthday = profile.User.Birthday,
                Role = profile.User.Role,
                OrganizationId = profile.OrganizationId,
                OrganizationName = profile.Organization?.Name,
                Bio = profile.Bio,
                Expertises = profile.Expertises,
                YearsOfExperience = profile.YearsOfExperience,
                Rating = profile.Rating,
                CoursesCount = profile.CoursesCount,
                IsActive = profile.User.IsActive,
                IsCompleted = profile.User.IsCompleted,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt
            };
        }
    }
}