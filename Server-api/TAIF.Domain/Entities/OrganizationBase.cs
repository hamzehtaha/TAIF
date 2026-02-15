namespace TAIF.Domain.Entities
{
    public class OrganizationBase : Base
    {
        public Guid? OrganizationId { get; set; }
        public Organization? Organization { get; set; }
    }
}
