using Certeo.Api.Common;

namespace Certeo.Api.Modules.Settings;

// Single-row table (application singleton) — reflects the "General" +
// "Security Policies" + "Integrations" tabs from the System Settings screen.
public sealed class SystemSettings : EntityBase
{
    public string ApplicationName { get; set; } = "CERTEO";
    public string? LogoUrl { get; set; }
    public string TimeZone { get; set; } = "Europe/Paris";

    // Email & Alert Preferences
    public bool IsNewApplicationAlertEnabled { get; set; } = true;
    public bool IsTrainingReminderAlertEnabled { get; set; } = true;
    public bool IsSystemUpdateAlertEnabled { get; set; } = false;

    // Security policies
    public int SessionTimeoutMinutes { get; set; } = 30;
    public int MinPasswordLength { get; set; } = 8;
    public bool IsPasswordUppercaseRequired { get; set; } = true;
    public bool IsPasswordSpecialCharRequired { get; set; } = true;
    public int? PasswordExpirationDays { get; set; } = 90;

    // External integrations
    public bool IsLinkedInSharingAllowed { get; set; } = false;
    public string? EncryptedLinkedInApiKey { get; set; }
    public bool IsOdcSyncActive { get; set; } = false;

    // SMTP
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public string? SmtpUsername { get; set; }
    public string? EncryptedSmtpPassword { get; set; }
}

public sealed class EmailTemplate : EntityBase
{
    public required EmailTemplateType Type { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}