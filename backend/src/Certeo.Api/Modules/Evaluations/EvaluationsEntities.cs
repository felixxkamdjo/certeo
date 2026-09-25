using Certeo.Api.Common;
using Certeo.Api.Modules.Participants;
using Certeo.Api.Modules.Trainings;

namespace Certeo.Api.Modules.Evaluations;

public sealed class Evaluation : EntityBase
{
    public Guid TrainingId { get; set; }
    public Training Training { get; set; } = null!;

    public required string Title { get; set; }
    public string? Description { get; set; }
    public EvaluationType Type { get; set; } = EvaluationType.MCQ;

    public int? EstimatedDurationMinutes { get; set; }
    public bool ShouldShuffleQuestions { get; set; } = false;
    public bool ShouldShuffleOptions { get; set; } = false;

    public int PassingScorePercentage { get; set; } = 70;
    public int MaxAllowedAttempts { get; set; } = 1;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<EvaluationQuestion> Questions { get; set; } = new List<EvaluationQuestion>();
    public ICollection<EvaluationAttempt> Attempts { get; set; } = new List<EvaluationAttempt>();
}

public sealed class EvaluationQuestion : EntityBase
{
    public Guid EvaluationId { get; set; }
    public Evaluation Evaluation { get; set; } = null!;

    public required string Statement { get; set; }
    public string? ImageUrl { get; set; }
    public string? Explanation { get; set; } // Displayed after answering
    public int Points { get; set; } = 1;
    public int Order { get; set; } = 0;

    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}

public sealed class QuestionOption : EntityBase
{
    public Guid EvaluationQuestionId { get; set; }
    public EvaluationQuestion EvaluationQuestion { get; set; } = null!;

    public required string Text { get; set; }
    public bool IsCorrect { get; set; } = false;
}

public sealed class EvaluationAttempt : EntityBase
{
    public Guid EvaluationId { get; set; }
    public Evaluation Evaluation { get; set; } = null!;

    public Guid ParticipantId { get; set; }
    public Participant Participant { get; set; } = null!;

    public int AttemptNumber { get; set; } = 1;
    public int EarnedScore { get; set; }
    public int TotalScore { get; set; }
    public bool HasPassed { get; set; }
    public int DurationSeconds { get; set; }

    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }

    public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
}

public sealed class AttemptAnswer : EntityBase
{
    public Guid EvaluationAttemptId { get; set; }
    public EvaluationAttempt EvaluationAttempt { get; set; } = null!;

    public Guid EvaluationQuestionId { get; set; }
    public EvaluationQuestion EvaluationQuestion { get; set; } = null!;

    public Guid? SelectedOptionId { get; set; }
    public QuestionOption? SelectedOption { get; set; }

    public int EarnedPoints { get; set; }
}