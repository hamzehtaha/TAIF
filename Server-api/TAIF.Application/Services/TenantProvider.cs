using TAIF.Application.Interfaces;

namespace TAIF.Application.Services
{
    /// <summary>
    /// Provides tenant context by wrapping IOrganizationContext.
    /// This service is injected into DbContext for automatic multi-tenancy filtering.
    /// </summary>
    public class TenantProvider : ITenantProvider
    {
        private readonly IOrganizationContext _organizationContext;

        public TenantProvider(IOrganizationContext organizationContext)
        {
            _organizationContext = organizationContext;
        }

        public Guid? OrganizationId => _organizationContext.OrganizationId;

        public Guid? UserId => _organizationContext.UserId == Guid.Empty ? null : _organizationContext.UserId;

        public bool IsSystemAdmin => _organizationContext.IsSystemAdmin;

        /// <summary>
        /// Tenant filter should be applied when:
        /// - User is NOT a SystemAdmin AND
        /// - OrganizationId is available (user is authenticated with org context)
        /// </summary>
        public bool ShouldApplyTenantFilter => !IsSystemAdmin && OrganizationId.HasValue;
    }
}
