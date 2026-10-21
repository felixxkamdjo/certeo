using Certeo.Api.Modules.Attendance.Dtos;

namespace Certeo.Api.Modules.Attendance;

public interface IAttendanceService
{
    // Retrieve paginated list of attendances matching query filters
    Task<AttendanceListResponse> GetListAsync(
        string? search,
        DateTime? date,
        Guid? trainingId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    // Record check-in attendance validating geofencing constraints
    Task<AttendanceItemResponse> RecordCheckInAsync(
        RecordAttendanceRequest request,
        CancellationToken cancellationToken = default);

    // Retrieve active entrance QR code token
    Task<QrCodeDetailsResponse> GetActiveQrCodeAsync(
        CancellationToken cancellationToken = default);

    // Retrieve single attendance entry details matching unique identifier
    Task<AttendanceItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}