using Certeo.Api.Common;
using Certeo.Api.Modules.Evaluations;
using Certeo.Api.Modules.Participants;
using Certeo.Api.Modules.Trainings;

namespace Certeo.Api.Modules.Certificates;

public sealed class Certificate : EntityBase
{
    public Guid ParticipantId { get; set; }
    public Participant Participant { get; set; } = null!;

    public Guid TrainingId { get; set; }
    public Training Training { get; set; } = null!;

    // a training might not require a quiz
    public Guid? EvaluationAttemptId { get; set; }
    public EvaluationAttempt? EvaluationAttempt { get; set; }

    public required string VerificationCode { get; set; }
    public required string PdfUrl { get; set; }
    public bool IsSharedOnLinkedIn { get; set; } = false;

    public DateTimeOffset GeneratedAt { get; set; } = DateTimeOffset.UtcNow;
}