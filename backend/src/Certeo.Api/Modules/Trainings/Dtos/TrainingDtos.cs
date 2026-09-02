using Certeo.Api.Common;

namespace Certeo.Api.Modules.Trainings.Dtos;

// Response DTOs
public sealed record TrainingListItemResponse(
    Guid Id,
    string Title,
    string? ImageUrl,
    string CategoryLabel,
    DateOnly StartDate,
    DateOnly EndDate,
    int MaxCapacity,
    int ApplicationsCount,
    int SelectedCount,
    TrainingStatus Status
);

public sealed record ApplicationFieldConfigResponse(
    StandardApplicationField Field,
    bool IsActive,
    bool IsRequired
);

public sealed record TrainingQuestionResponse(
    Guid Id,
    string Prompt,
    TrainingQuestionType Type,
    List<string>? Options,
    bool IsRequired,
    int Order
);

public sealed record TrainingDetailResponse(
    Guid Id,
    string Title,
    string? Description,
    string? ImageUrl,
    Guid CategoryId,
    string CategoryLabel,
    DateOnly StartDate,
    DateOnly EndDate,
    DateOnly ApplicationDeadline,
    string? Location,
    TrainingMode Mode,
    int MaxCapacity,
    int MinCapacity,
    string? TargetAudience,
    string? SocialMediaMessage,
    string? PromotionalPosterUrl,
    bool IsQuizMandatory,
    bool IsCertificateEnabled,
    TrainingStatus Status,
    string Slug,
    string CreatedByFullName,
    DateTimeOffset CreatedAt,
    int ApplicationsCount,
    int SelectedCount,
    double CompletionRatePercent,
    List<ApplicationFieldConfigResponse> ApplicationFields,
    List<TrainingQuestionResponse> CustomQuestions
);

// Request DTOs
public sealed record CreateTrainingRequest(
    string Title,
    string? Description,
    string? ImageUrl,
    Guid CategoryId,
    DateOnly StartDate,
    DateOnly EndDate,
    DateOnly ApplicationDeadline,
    string? Location,
    TrainingMode Mode,
    int MaxCapacity,
    int MinCapacity,
    string? TargetAudience,
    string? SocialMediaMessage,
    string? PromotionalPosterUrl,
    bool IsQuizMandatory,
    bool IsCertificateEnabled,
    bool PublishImmediately
);

public sealed record UpdateTrainingRequest(
    string Title,
    string? Description,
    string? ImageUrl,
    Guid CategoryId,
    DateOnly StartDate,
    DateOnly EndDate,
    DateOnly ApplicationDeadline,
    string? Location,
    TrainingMode Mode,
    int MaxCapacity,
    int MinCapacity,
    string? TargetAudience,
    string? SocialMediaMessage,
    string? PromotionalPosterUrl,
    bool IsQuizMandatory,
    bool IsCertificateEnabled
);

public sealed record StandardFieldConfigRequest(
    StandardApplicationField Field,
    bool IsActive,
    bool IsRequired
);

public sealed record CustomQuestionRequest(
    Guid? Id,               // optional for new questions, required for updates
    string Prompt,
    TrainingQuestionType Type,
    List<string>? Options,
    bool IsRequired,
    int Order
);

public sealed record ApplicationFormConfigRequest(
    List<StandardFieldConfigRequest> StandardFields,
    List<CustomQuestionRequest> CustomQuestions
);
