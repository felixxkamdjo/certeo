using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Certeo.Api.Common;
using Certeo.Api.Modules.Trainings;
using Certeo.Api.Modules.Trainings.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certeo.Api.Controllers;

[ApiController]
[Route("api/trainings")]
[Authorize]
public sealed class TrainingsController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingsController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    // GET /api/trainings?status=PUBLISHED&categoryId=...&search=web&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<PagedResult<TrainingListItemResponse>>> GetList(
        [FromQuery] TrainingStatus? status,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _trainingService.GetListAsync(status, categoryId, search, page, pageSize, cancellationToken);
        return Ok(result);
    }

    // GET /api/trainings/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrainingDetailResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _trainingService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    // GET /api/trainings/slug/{slug} — accès public, sans authentification.
    // Utilisé plus tard par la page publique de candidature (lien partagé).
    [AllowAnonymous]
    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<TrainingDetailResponse>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _trainingService.GetPublicBySlugAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    // POST /api/trainings
    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<ActionResult<TrainingDetailResponse>> Create(
        [FromBody] CreateTrainingRequest request, CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _trainingService.CreateAsync(request, currentUserId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/trainings/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<ActionResult<TrainingDetailResponse>> Update(
        Guid id, [FromBody] UpdateTrainingRequest request, CancellationToken cancellationToken)
    {
        var result = await _trainingService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    // POST /api/trainings/{id}/publish
    [HttpPost("{id:guid}/publish")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken cancellationToken)
    {
        await _trainingService.PublishAsync(id, cancellationToken);
        return NoContent();
    }

    // POST /api/trainings/{id}/archive
    [HttpPost("{id:guid}/archive")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        await _trainingService.ArchiveAsync(id, cancellationToken);
        return NoContent();
    }

    // DELETE /api/trainings/{id} — volontairement restreint : seuls Super Admin / Admin
    // peuvent supprimer définitivement (les Trainers peuvent archiver, pas supprimer).
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _trainingService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    // PUT /api/trainings/{id}/application-form
    [HttpPut("{id:guid}/application-form")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
    public async Task<IActionResult> UpdateApplicationForm(
        Guid id, [FromBody] ApplicationFormConfigRequest request, CancellationToken cancellationToken)
    {
        await _trainingService.UpdateApplicationFormAsync(id, request, cancellationToken);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var rawId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (rawId is null || !Guid.TryParse(rawId, out var userId))
        {
            throw new DomainValidationException("Utilisateur non identifié dans le token.");
        }

        return userId;
    }
}
