namespace TAIF.Domain.Entities
{
    /// <summary>
    /// Many-to-many mapping between Interest and Tag with a relevance weight.
    /// The weight (0-1) indicates how strongly a tag relates to an interest.
    /// </summary>
    public class InterestTagMapping : OrganizationBase
    {
        public Guid InterestId { get; set; }
        public Interest Interest { get; set; } = null!;
        public Guid TagId { get; set; }
        public Tag Tag { get; set; } = null!;
        public double Weight { get; set; } = 0.5;
    }
}
