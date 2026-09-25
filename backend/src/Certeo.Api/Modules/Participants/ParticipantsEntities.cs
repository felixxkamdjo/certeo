using Certeo.Api.Common;
using Certeo.Api.Modules.Applications;
using Certeo.Api.Modules.MasterData;
using Certeo.Api.Modules.Trainings;

namespace Certeo.Api.Modules.Participants;

// Automatically created when an Application reaches "SELECTED" status AND the invitation
// is confirmed. Personal data remains stored in Application (prevents duplication).
public sealed class Participant : EntityBase
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    // Seen in the "Participant Management" screen: detailed tracking, not just present/absent
    public decimal AttendanceRate { get; set; } = 0;
    public ParticipantStatus Status { get; set; } = ParticipantStatus.ACTIVE;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}

public sealed class Attendance : EntityBase
{
    // Filled if the reason is "Training" (participant already identified)
    public Guid? ParticipantId { get; set; }
    public Participant? Participant { get; set; }

    // Filled if non-participant visitor
    public string? VisitorLastName { get; set; }
    public string? VisitorFirstName { get; set; }
    public string? VisitorEmail { get; set; }
    public string? VisitorPhone { get; set; }
    public Gender? Gender { get; set; }

    public Guid? AgeRangeId { get; set; }
    public ReferenceData? AgeRange { get; set; }

    public Guid VisitReasonId { get; set; }
    public ReferenceData VisitReason { get; set; } = null!;

    public Guid? TrainingId { get; set; }         // if reason = Training
    public Training? Training { get; set; }

    // Geofencing (UX recommendation #2 — anti-fraud for static QR code)
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal DistanceFromCenterMeters { get; set; }
    public bool IsValid { get; set; }

    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<AttendanceProfile> Profiles { get; set; } = new List<AttendanceProfile>();
}

// N-N join table: a visitor can check multiple profiles at once
// (e.g. "Student" AND "Job Seeker" simultaneously) — seen in the mobile form.
public sealed class AttendanceProfile : EntityBase
{
    public Guid AttendanceId { get; set; }
    public Attendance Attendance { get; set; } = null!;

    public Guid ProfileId { get; set; }
    public ReferenceData Profile { get; set; } = null!;
}

// Token for the entrance QR Code, periodically rotated (UX recommendation #2).
// The Location field anticipates possible future multi-site support (seen in mockup: "ODC-HQ-01").
public sealed class CenterQrCode : EntityBase
{
    public required string Location { get; set; } = "ODC-HQ-01";
    public required string Token { get; set; }
    public DateTimeOffset GeneratedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}