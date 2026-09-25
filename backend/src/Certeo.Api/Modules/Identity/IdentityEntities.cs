using Certeo.Api.Common;

namespace Certeo.Api.Modules.Identity;

public sealed class Role : EntityBase
{
    public required RoleName Name { get; set; }
    public string? Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}

public sealed class User : EntityBase
{
    public required string LastName { get; set; }
    public required string FirstName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? Phone { get; set; }
    public string? PhotoUrl { get; set; }

    // Seen in the "User Profile" screen
    public string? Department { get; set; }
    public string? Location { get; set; }
    public string Language { get; set; } = "en";
    public bool IsTwoFactorEnabled { get; set; } = false;

    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAt { get; set; }

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

// Enables "Log out from all active devices" feature seen in User Profile:
// each login creates a refresh token; revoking all of them = global logout.
public sealed class RefreshToken : EntityBase
{
    public required string Token { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTimeOffset DateExpiration { get; internal set; }
}

public sealed class AuditLog : EntityBase
{
    public required string Action { get; set; }         // e.g. "TRAINING_CREATION"
    public string? Entity { get; set; }                 // e.g. "Training"
    public Guid? EntityId { get; set; }
    public string? DetailsJson { get; set; }            // jsonb on PostgreSQL side
    public string? IpAddress { get; set; }
    public DateTimeOffset PerformedAt { get; set; } = DateTimeOffset.UtcNow;

    public Guid? UserId { get; set; }
    public User? User { get; set; }
}