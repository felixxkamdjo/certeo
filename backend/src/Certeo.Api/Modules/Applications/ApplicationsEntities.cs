using Certeo.Api.Common;
using Certeo.Api.Modules.MasterData;
using Certeo.Api.Modules.Participants;
using Certeo.Api.Modules.Trainings;

namespace Certeo.Api.Modules.Applications;

public sealed class Application : EntityBase
{
    public Guid TrainingId { get; set; }
    public Training Training { get; set; } = null!;

    // Personal information
    public required string LastName { get; set; }
    public required string FirstName { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public Guid? GenderId { get; set; }
    public ReferenceData? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }

    // Academic & professional background
    public Guid? EducationLevelId { get; set; }
    public ReferenceData? EducationLevel { get; set; }
    public string? SchoolOrUniversity { get; set; }
    public int? GraduationYear { get; set; }
    public string? Specialization { get; set; }
    public string? CurrentOccupation { get; set; }

    // Experience & CV
    public required string CvUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public bool? HasPersonalComputer { get; set; }

    // Motivation
    public string? CoverLetter { get; set; }
    public Guid? OdcDiscoverySourceId { get; set; }
    public ReferenceData? OdcDiscoverySource { get; set; }

    public required string FileNumber { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.PENDING;
    public DateTimeOffset ApplicationDate { get; set; } = DateTimeOffset.UtcNow;

    // GDPR auto-purge
    public DateTimeOffset? ScheduledPurgeDate { get; set; }

    public ICollection<ApplicationAnswer> Answers { get; set; } = new List<ApplicationAnswer>();
    public Participant? Participant { get; set; }
}

public sealed class ApplicationAnswer : EntityBase
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public Guid TrainingQuestionId { get; set; }
    public TrainingQuestion TrainingQuestion { get; set; } = null!;

    public required string Value { get; set; }
}