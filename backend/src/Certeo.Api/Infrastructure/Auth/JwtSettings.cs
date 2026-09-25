namespace Certeo.Api.Infrastructure.Auth;

public sealed class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public required string SigningKey { get; set; }
    public int AccessTokenExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}