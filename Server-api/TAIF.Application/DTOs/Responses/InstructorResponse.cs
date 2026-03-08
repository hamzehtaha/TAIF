namespace TAIF.Application.DTOs.Responses
{
    public class InstructorResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Bio { get; set; }
        public List<string> Expertises { get; set; } = new();
        public int YearsOfExperience { get; set; }
        public Guid? OrganizationId { get; set; }
    }
}
