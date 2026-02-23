using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.Responses
{
    public record InstructorProfileResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateOnly Birthday { get; set; }
        public UserRoleType Role { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public string? Bio { get; set; }
        public List<string> Expertises { get; set; } = new List<string>();
        public int YearsOfExperience { get; set; }
        public decimal Rating { get; set; }
        public int CoursesCount { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
