namespace TAIF.Application.DTOs.Requests
{
    public class UpdateInstructorProfileRequest
    {
        public Guid? OrganizationId { get; set; }
        public string? WebsiteUrl { get; set; }
        public int YearsOfExperience { get; set; }
    }
}