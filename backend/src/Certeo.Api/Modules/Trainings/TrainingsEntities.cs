using Certeo.Api.Common;
using Certeo.Api.Modules.Applications;
using Certeo.Api.Modules.Evaluations;
using Certeo.Api.Modules.Identity;
using Certeo.Api.Modules.MasterData;

namespace Certeo.Api.Modules.Trainings;

public sealed class Training : EntityBase
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    public Guid CategoryId { get; set; }
    public ReferenceData Category { get; set; } = null!;

    // Scheduling
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateOnly ApplicationDeadline { get; set; }
    public string? Location { get; set; }
    public TrainingMode Mode { get; set; } = TrainingMode.IN_PERSON;

    // Capacity
    public int MaxCapacity { get; set; }
    public int MinCapacity { get; set; }

    // Communication (step 3 of the creation wizard)
    public string? TargetAudience { get; set; }
    public string? SocialMediaMessage { get; set; }   // limited to 144 characters at application validation level
    public string? PromotionalPosterUrl { get; set; }

    // Settings
    public bool IsQuizMandatory { get; set; } = false;
    public bool IsCertificateEnabled { get; set; } = true;
    public TrainingStatus Status { get; set; } = TrainingStatus.DRAFT;

    public required string Slug { get; set; }

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<TrainingApplicationField> ApplicationFields { get; set; } = new List<TrainingApplicationField>();
    public ICollection<TrainingQuestion> CustomQuestions { get; set; } = new List<TrainingQuestion>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public Evaluation? Evaluation { get; set; }
}

// Reflects the "Application Form Configuration > Standard Fields" screen:
// Last Name/First Name, Email, Phone, LinkedIn, CV can be enabled/disabled and made
// mandatory INDEPENDENTLY for each training.
public sealed class TrainingApplicationField : EntityBase
{
    public Guid TrainingId { get; set; }
    public Training Training { get; set; } = null!;

    public required StandardApplicationField Field { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsRequired { get; set; } = true;
}

// Custom questions added per training ("Custom Questions" section).
public sealed class TrainingQuestion : EntityBase
{
    public Guid TrainingId { get; set; }
    public Training Training { get; set; } = null!;

    public required string Prompt { get; set; }
    public required TrainingQuestionType Type { get; set; }
    public string? OptionsJson { get; set; }   // jsonb: list of choices if SingleChoice/MultipleChoice/Dropdown
    public bool IsRequired { get; set; } = true;
    public int Order { get; set; } = 0;
}