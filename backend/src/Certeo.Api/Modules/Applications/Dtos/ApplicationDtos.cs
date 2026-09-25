using Microsoft.AspNetCore.Http;
using Certeo.Api.Common;

namespace Certeo.Api.Modules.Applications.Dtos;

// DTOs for application-related operations, including form submission and response structures.
public sealed class CreateApplicationForm
{
    public Guid TrainingId { get; set; }

    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Country { get; set; }
    public Guid? GenderId { get; set; }
    public DateOnly? DateOfBirth { get; set; }

    public Guid? EducationLevelId { get; set; }
    public string? SchoolOrUniversity { get; set; }
    public int? GraduationYear { get; set; }
    public string? Specialization { get; set; }
    public string? CurrentOccupation { get; set; }

    public IFormFile? Cv { get; set; }
    public string? PortfolioUrl { get; set; }
    public bool? HasPersonalComputer { get; set; }

    public string? CoverLetter { get; set; }
    public Guid? OdcDiscoverySourceId { get; set; }

    // Json serialized : [{"trainingQuestionId":"...","value":"..."}]
    public string? AnswersJson { get; set; }
}

public sealed record ApplicationAnswerResponse(Guid TrainingQuestionId, string Prompt, string Value);

public sealed record ApplicationListItemResponse(
    Guid Id,
    string FullName,
    string Email,
    string Phone,
    Guid TrainingId,
    string TrainingTitle,
    DateTimeOffset ApplicationDate,
    ApplicationStatus Status
);

public sealed record ApplicationDetailResponse(
    Guid Id,
    Guid TrainingId,
    string TrainingTitle,
    string LastName,
    string FirstName,
    string Email,
    string Phone,
    string? City,
    string? Country,
    string? GenderLabel,
    DateOnly? DateOfBirth,
    string? EducationLevelLabel,
    string? SchoolOrUniversity,
    int? GraduationYear,
    string? Specialization,
    string? CurrentOccupation,
    string CvUrl,
    string? PortfolioUrl,
    bool? HasPersonalComputer,
    string? CoverLetter,
    string? OdcDiscoverySourceLabel,
    string FileNumber,
    ApplicationStatus Status,
    DateTimeOffset ApplicationDate,
    List<ApplicationAnswerResponse> Answers
);

public sealed record BulkSelectRequest(List<Guid> ApplicationIds);
