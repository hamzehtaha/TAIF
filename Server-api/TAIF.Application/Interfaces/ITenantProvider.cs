namespace TAIF.Application.Interfaces
{
    /// <summary>
    /// Provides tenant (organization) context for automatic multi-tenancy filtering.
    /// Used by DbContext to apply global query filters and auto-set OrganizationId on insert.
    /// </summary>
    public interface ITenantProvider
    {
        /// <summary>
        /// Gets the current organization ID from the request context.
        /// Returns null for SystemAdmin users (who can access all organizations).
        /// </summary>
        Guid? OrganizationId { get; }

        /// <summary>
        /// Gets the current user ID from the request context.
        /// </summary>
        Guid? UserId { get; }

        /// <summary>
        /// Indicates if the current user is a SystemAdmin (bypasses tenant filtering).
        /// </summary>
        bool IsSystemAdmin { get; }

        /// <summary>
        /// Indicates if tenant filtering should be applied.
        /// Returns false for SystemAdmin users or when no tenant context is available.
        /// </summary>
        bool ShouldApplyTenantFilter { get; }
    }
}
