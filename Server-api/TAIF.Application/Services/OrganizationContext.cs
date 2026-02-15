using TAIF.Application.Interfaces;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class OrganizationContext : IOrganizationContext
    {
        public Guid? OrganizationId { get; private set; }
        public Guid UserId { get; private set; }
        public int Role { get; private set; }

        public bool IsSystemAdmin => Role == (int)UserRoleType.SystemAdmin;
        public bool IsOrgAdmin => Role == (int)UserRoleType.OrgAdmin;
        public bool IsInstructor => Role == (int)UserRoleType.Instructor;
        public bool IsStudent => Role == (int)UserRoleType.Student;

        public void SetContext(Guid userId, Guid? organizationId, int role)
        {
            UserId = userId;
            OrganizationId = organizationId;
            Role = role;
        }
    }
}
