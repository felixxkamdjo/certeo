namespace Certeo.Api.Modules.Attendance.Dtos;

// Hold KPI statistics for the attendance dashboard
public sealed record AttendanceKpisResponse(
    int TodayCount,
    int WeeklyAverage,
    int PercentageTrend,
    string MostFrequentReason,
    int MostFrequentReasonPercentage);

// Represent a single attendance item for tabular listing
public sealed record AttendanceItemResponse(
    Guid Id,
    string FullName,
    string? FirstName,
    string? LastName,
    string Email,
    string? Phone,
    string? ProfileLabel,
    string? ProfileCode,
    Guid VisitReasonId,
    string VisitReasonLabel,
    Guid? TrainingId,
    string? TrainingTitle,
    double Latitude,
    double Longitude,
    double DistanceFromCenterMeters,
    bool IsValid,
    DateTime Timestamp);

// Encapsulate paginated attendance records accompanied by computed KPIs
public sealed record AttendanceListResponse(
    IReadOnlyList<AttendanceItemResponse> Items,
    int TotalCount,
    int Page,
    int PageSize,
    AttendanceKpisResponse Kpis);

// Accept visitor or participant check-in command with geolocation
public sealed record RecordAttendanceRequest(
    Guid? ParticipantId,
    string? VisitorFirstName,
    string? VisitorLastName,
    string? VisitorEmail,
    string? VisitorPhone,
    Guid? ProfileId,
    Guid VisitReasonId,
    Guid? TrainingId,
    double Latitude,
    double Longitude,
    string QrCodeToken);

// Expose active center QR code metadata
public sealed record QrCodeDetailsResponse(
    string Token,
    string Location,
    DateTime GeneratedAt,
    DateTime ExpiresAt,
    bool IsActive);