using Microsoft.AspNetCore.Identity;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    /// <summary>
    /// Centralized password hashing utility using PBKDF2 via ASP.NET Core PasswordHasher.
    /// </summary>
    public static class PasswordHelper
    {
        private static readonly PasswordHasher<User> _hasher = new();

        public static string Hash(string password) =>
            _hasher.HashPassword(null!, password);

        public static bool Verify(string hashedPassword, string providedPassword) =>
            _hasher.VerifyHashedPassword(null!, hashedPassword, providedPassword)
                != PasswordVerificationResult.Failed;
    }
}
