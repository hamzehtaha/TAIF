namespace TAIF.Application.Interfaces
{
    public interface IOrganizationContext
    {
        Guid? OrganizationId { get; }
        Guid UserId { get; }
        int Role { get; }
        bool IsSystemAdmin { get; }
        bool IsOrgAdmin { get; }
        bool IsInstructor { get; }
        bool IsStudent { get; }
        
        void SetContext(Guid userId, Guid? organizationId, int role);
    }
}
