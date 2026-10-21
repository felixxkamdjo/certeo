using Certeo.Api.Modules.Attendance;
using Certeo.Api.Modules.Attendance.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certeo.Api.Controllers;

[ApiController]
[Route("api/attendances")]
[Authorize]
public sealed class AttendancesController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendancesController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    // Fetch paginated attendance records with search and date filters
    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<ActionResult<AttendanceListResponse>> GetList(
        [FromQuery] string? search,
        [FromQuery] DateTime? date,
        [FromQuery] Guid? trainingId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _attendanceService.GetListAsync(search, date, trainingId, page, pageSize, cancellationToken);
        return Ok(result);
    }

    // Submit visitor attendance check-in without requiring prior authentication
    [AllowAnonymous]
    [HttpPost("check-in")]
    public async Task<ActionResult<AttendanceItemResponse>> CheckIn(
        [FromBody] RecordAttendanceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _attendanceService.RecordCheckInAsync(request, cancellationToken);
        return Ok(result);
    }

    // Retrieve active reception center QR code details
    [HttpGet("qrcode")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<ActionResult<QrCodeDetailsResponse>> GetQrCode(CancellationToken cancellationToken)
    {
        var result = await _attendanceService.GetActiveQrCodeAsync(cancellationToken);
        return Ok(result);
    }

    // Fetch single attendance record by identifier
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<ActionResult<AttendanceItemResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _attendanceService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}