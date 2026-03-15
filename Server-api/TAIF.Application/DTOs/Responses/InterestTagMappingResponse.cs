namespace TAIF.Application.DTOs.Responses
{
    public class InterestTagMappingResponse
    {
        public Guid Id { get; set; }
        public Guid InterestId { get; set; }
        public Guid TagId { get; set; }
        public double Weight { get; set; }
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
