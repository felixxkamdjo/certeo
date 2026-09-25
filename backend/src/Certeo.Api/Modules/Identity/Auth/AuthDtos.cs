namespace Certeo.Api.Modules.Identity.Auth;

public sealed record LoginRequest(string Email, string Password);

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset AccessTokenExpiresAt,
    string UserFullName,
    string UserEmail,
    string Role
);