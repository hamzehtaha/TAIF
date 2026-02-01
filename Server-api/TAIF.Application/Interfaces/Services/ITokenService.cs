using TAIF.Domain.Entities;

namespace TAIF.Application.Interfaces.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken(User user);
}
