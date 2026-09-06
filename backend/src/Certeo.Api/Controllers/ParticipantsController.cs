using Certeo.Api.Modules.Participants;
using Certeo.Api.Modules.Participants.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Certeo.Api.Controllers;

[ApiController]
[Route("api/participants")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN,TRAINER")]
public sealed class ParticipantsController : ControllerBase
{
    private readonly IParticipantService _participantService;

    public ParticipantsController(IParticipantService participantService)
    {
        _participantService = participantService;
    }

    // GET /api/participants?trainingId=    return a list of participants, no pagination
    // (contract already fixed with frontend : Observable<Participant[]>)
    [HttpGet]
    public async Task<ActionResult<List<ParticipantResponse>>> GetList(
        [FromQuery] Guid? trainingId, CancellationToken cancellationToken)
    {
        var result = await _participantService.GetListAsync(trainingId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ParticipantResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _participantService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}