using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Domain.Entities
{
    public class User : OrganizationBase
    {
        public User() { }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public DateOnly Birthday { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsCompleted { get; set; } = true;
        public bool EmailVerified { get; set; } = false;
        public UserRoleType Role { get; set; } = UserRoleType.Student;

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAt { get; set; }

        // Verification — shared by all channels (Email, SMS, WhatsApp)
        public string? VerificationToken { get; set; }        // PBKDF2 hash of the OTP
        public DateTime? VerificationTokenExpiresAt { get; set; }
        public string? VerificationChannel { get; set; }       // "Email" | "SMS" | "WhatsApp"

        // Account lockout
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }

        public ICollection<Guid> Interests { get; set; } = new List<Guid>();
    }
}
