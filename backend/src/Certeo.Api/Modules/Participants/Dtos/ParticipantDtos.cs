using Certeo.Api.Common;

namespace Certeo.Api.Modules.Participants.Dtos;

public sealed record ParticipantResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string? City,
    string? Country,
    string? CurrentOccupation,
    Guid TrainingId,
    string? TrainingTitle,
    int EvaluationsCount,
    double? AverageScore,
    bool Certified,
    DateTimeOffset RegisteredAt,
    ParticipantStatus Status,
    decimal AttendanceRate
);