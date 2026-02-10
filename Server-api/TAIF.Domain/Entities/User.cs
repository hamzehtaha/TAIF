using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class User : Base
    {
        public User() { }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public DateOnly Birthday { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsCompleted { get; set; } = true;
        public UserRoleType UserRoleType { get; set; } = UserRoleType.User;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAt { get; set; }
        public ICollection<Guid> Interests { get; set; } = new List<Guid>();
        public ICollection<Course> CreatedCourses { get; set; } = new List<Course>();
    }
}
