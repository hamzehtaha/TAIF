using System;
using TAIF.Domain.Entities;

namespace TAIF.Application.DTOs.Responses
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateOnly Birthday { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsCompleted { get; set; } = false;
        public bool EmailVerified { get; set; } = false;
        public UserRoleType Role { get; set; }
        public string RoleName { get; set; } = null!;
        public UserRoleType UserRoleType { get; set; }
        public List<Guid> Interests { get; set; } = new();
        public Guid? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
