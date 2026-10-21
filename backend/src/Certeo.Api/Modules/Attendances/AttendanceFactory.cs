using Certeo.Api.Modules.Attendance.Dtos;
using AttendanceEntity = Certeo.Api.Modules.Participants.Attendance;

namespace Certeo.Api.Modules.Attendance;

public static class AttendanceFactory
{
    // Build attendance entity for enrolled participants
    public static AttendanceEntity CreateForParticipant(
        RecordAttendanceRequest request,
        double distanceMeters,
        bool isValid)
    {
        return new AttendanceEntity
        {
            Id = Guid.NewGuid(),
            ParticipantId = request.ParticipantId,
            VisitReasonId = request.VisitReasonId,
            TrainingId = request.TrainingId,
            Latitude = (decimal)request.Latitude,
            Longitude = (decimal)request.Longitude,
            DistanceFromCenterMeters = (decimal)distanceMeters,
            IsValid = isValid,
            Timestamp = DateTimeOffset.UtcNow
        };
    }

    // Build attendance entity for external visitors
    public static AttendanceEntity CreateForVisitor(
        RecordAttendanceRequest request,
        double distanceMeters,
        bool isValid)
    {
        return new AttendanceEntity
        {
            Id = Guid.NewGuid(),
            VisitorFirstName = request.VisitorFirstName?.Trim(),
            VisitorLastName = request.VisitorLastName?.Trim(),
            VisitorEmail = request.VisitorEmail?.Trim().ToLowerInvariant(),
            VisitorPhone = request.VisitorPhone?.Trim(),
            VisitReasonId = request.VisitReasonId,
            TrainingId = request.TrainingId,
            Latitude = (decimal)request.Latitude,
            Longitude = (decimal)request.Longitude,
            DistanceFromCenterMeters = (decimal)distanceMeters,
            IsValid = isValid,
            Timestamp = DateTimeOffset.UtcNow
        };
    }
}