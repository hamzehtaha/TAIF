namespace TAIF.Application.DTOs.Requests
{
    public class CreateOrganizationRequest
    {
        public string Name { get; set; } = null!;
        public string? Logo { get; set; }
        public string? Description { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}