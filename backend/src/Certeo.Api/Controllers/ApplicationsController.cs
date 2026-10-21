using Certeo.Api.Common;
using Certeo.Api.Modules.Applications;
using Certeo.Api.Modules.Applications.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certeo.Api.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
public sealed class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [AllowAnonymous]
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<ApplicationDetailResponse>> Submit(
        [FromForm] CreateApplicationForm form, CancellationToken cancellationToken)
    {
        var result = await _applicationService.SubmitAsync(form, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpGet]
    public async Task<ActionResult<PagedResult<ApplicationListItemResponse>>> GetList(
        [FromQuery] Guid? trainingId,
        [FromQuery] ApplicationStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _applicationService.GetListAsync(trainingId, status, search, page, pageSize, cancellationToken);
        return Ok(result);
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApplicationDetailResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _applicationService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpPost("{id:guid}/interview")]
    public async Task<IActionResult> MoveToInterview(Guid id, CancellationToken cancellationToken)
    {
        await _applicationService.MoveToInterviewAsync(id, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpPost("{id:guid}/evaluate")]
    public async Task<IActionResult> Evaluate(Guid id, CancellationToken cancellationToken)
    {
        await _applicationService.MarkEvaluatedAsync(id, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpPost("{id:guid}/select")]
    public async Task<IActionResult> Select(Guid id, CancellationToken cancellationToken)
    {
        await _applicationService.SelectAsync(id, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpPost("bulk-select")]
    public async Task<IActionResult> BulkSelect([FromBody] BulkSelectRequest request, CancellationToken cancellationToken)
    {
        await _applicationService.BulkSelectAsync(request.ApplicationIds, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken)
    {
        await _applicationService.RejectAsync(id, cancellationToken);
        return NoContent();
    }
}