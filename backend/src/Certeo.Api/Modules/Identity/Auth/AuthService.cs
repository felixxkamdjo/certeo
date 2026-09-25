using Certeo.Api.Infrastructure;
using Certeo.Api.Infrastructure.Auth;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Modules.Identity.Auth;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
}

public sealed class AuthService : IAuthService
{
    private readonly CerteoDbContext _context;
    private readonly JwtTokenGenerator _tokenGenerator;

    public AuthService(CerteoDbContext context, JwtTokenGenerator tokenGenerator)
    {
        _context = context;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<LoginResponse?> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!passwordValid)
        {
            return null;
        }

        var accessToken = _tokenGenerator.GenerateAccessToken(user);
        var refreshTokenValue = _tokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiration = _tokenGenerator.RefreshTokenExpiration();

        _context.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            DateExpiration = refreshTokenExpiration,
            IsRevoked = false
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            AccessToken: accessToken,
            RefreshToken: refreshTokenValue,
            AccessTokenExpiresAt: DateTimeOffset.UtcNow.AddMinutes(15),
            UserFullName: $"{user.FirstName} {user.LastName}",
            UserEmail: user.Email,
            Role: user.Role.Name.ToString()
        );
    }
}