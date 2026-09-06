using Certeo.Api.Common;
using Certeo.Api.Infrastructure;
using Certeo.Api.Modules.Participants.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Modules.Participants;

public interface IParticipantService
{
    Task<List<ParticipantResponse>> GetListAsync(Guid? trainingId, CancellationToken cancellationToken);
    Task<ParticipantResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}

public sealed class ParticipantService : IParticipantService
{
    private readonly CerteoDbContext _context;

    public ParticipantService(CerteoDbContext context)
    {
        _context = context;
    }

    public async Task<List<ParticipantResponse>> GetListAsync(Guid? trainingId, CancellationToken cancellationToken)
    {
        var query = _context.Participants
            .Include(p => p.Application)
            .ThenInclude(a => a.Training)
            .AsQueryable();

        if (trainingId.HasValue)
        {
            query = query.Where(p => p.Application.TrainingId == trainingId.Value);
        }

        var participants = await query.ToListAsync(cancellationToken);
        return participants.Select(Project).ToList();
    }

    public async Task<ParticipantResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var participant = await _context.Participants
            .Include(p => p.Application)
            .ThenInclude(a => a.Training)
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

        return participant is null ? null : Project(participant);
    }

    private ParticipantResponse Project(Participant p)
    {
        var completedAttempts = _context.EvaluationAttempts
            .Where(a => a.ParticipantId == p.Id && a.CompletedAt != null)
            .Select(a => a.TotalScore == 0 ? 0.0 : (double)a.EarnedScore / a.TotalScore * 100)
            .ToList();

        return new ParticipantResponse(
            p.Id,
            p.Application.FirstName,
            p.Application.LastName,
            p.Application.Email,
            p.Application.Phone,
            p.Application.City,
            p.Application.Country,
            p.Application.CurrentOccupation,
            p.Application.TrainingId,
            p.Application.Training.Title,
            completedAttempts.Count,
            completedAttempts.Count > 0 ? completedAttempts.Average() : null,
            _context.Certificates.Any(c => c.ParticipantId == p.Id),
            p.CreatedAt,
            p.Status,
            p.AttendanceRate
        );        
    }
}