namespace TAIF.Application.DTOs.Responses
{
    public class TagResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Guid? OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
