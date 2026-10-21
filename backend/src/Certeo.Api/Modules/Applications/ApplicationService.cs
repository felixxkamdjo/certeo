using System.Security.Cryptography;
using System.Text.Json;
using Certeo.Api.Common;
using Certeo.Api.Infrastructure;
using Certeo.Api.Infrastructure.Storage;
using Certeo.Api.Modules.Applications.Dtos;
using Certeo.Api.Modules.Participants;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Modules.Applications;

public interface IApplicationService
{
    Task<ApplicationDetailResponse> SubmitAsync(CreateApplicationForm form, CancellationToken cancellationToken);

    Task<PagedResult<ApplicationListItemResponse>> GetListAsync(
        Guid? trainingId, ApplicationStatus? status, string? search, int page, int pageSize, CancellationToken cancellationToken);

    Task<ApplicationDetailResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task MoveToInterviewAsync(Guid id, CancellationToken cancellationToken);
    Task MarkEvaluatedAsync(Guid id, CancellationToken cancellationToken);
    Task SelectAsync(Guid id, CancellationToken cancellationToken);
    Task BulkSelectAsync(List<Guid> applicationIds, CancellationToken cancellationToken);
    Task RejectAsync(Guid id, CancellationToken cancellationToken);
}

public sealed class ApplicationService : IApplicationService
{
    private static readonly string[] AllowedCvExtensions = [".pdf", ".docx"];
    private const long MaxCvSizeBytes = 5 * 1024 * 1024;
    private const int GdprPurgeDelayDays = 90;

    private readonly CerteoDbContext _context;
    private readonly IFileStorageService _fileStorage;

    public ApplicationService(CerteoDbContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<ApplicationDetailResponse> SubmitAsync(CreateApplicationForm form, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings
            .Include(t => t.ApplicationFields)
            .Include(t => t.CustomQuestions)
            .SingleOrDefaultAsync(t => t.Id == form.TrainingId, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        if (training.Status is not (TrainingStatus.PUBLISHED or TrainingStatus.IN_PROGRESS))
        {
            throw new DomainValidationException("Cette formation n'accepte pas de candidatures actuellement.");
        }

        if (DateOnly.FromDateTime(DateTime.UtcNow) > training.ApplicationDeadline)
        {
            throw new DomainValidationException("La date limite de candidature pour cette formation est dépassée.");
        }

        if (string.IsNullOrWhiteSpace(form.LastName) || string.IsNullOrWhiteSpace(form.FirstName)
            || string.IsNullOrWhiteSpace(form.Email) || string.IsNullOrWhiteSpace(form.Phone))
        {
            throw new DomainValidationException("Nom, prénom, email et téléphone sont obligatoires.");
        }

        if (form.Cv is null || form.Cv.Length == 0)
        {
            throw new DomainValidationException("Le CV est obligatoire.");
        }

        var extension = Path.GetExtension(form.Cv.FileName).ToLowerInvariant();
        if (!AllowedCvExtensions.Contains(extension))
        {
            throw new DomainValidationException("Le CV doit être un fichier PDF ou DOCX.");
        }

        if (form.Cv.Length > MaxCvSizeBytes)
        {
            throw new DomainValidationException("Le CV ne doit pas dépasser 5 Mo.");
        }

        var linkedInConfig = training.ApplicationFields.SingleOrDefault(f => f.Field == StandardApplicationField.LINKEDIN_URL);
        if (linkedInConfig is { IsActive: true, IsRequired: true } && string.IsNullOrWhiteSpace(form.PortfolioUrl))
        {
            throw new DomainValidationException("Le lien LinkedIn/Portfolio est obligatoire pour cette formation.");
        }

        var answers = ParseAnswers(form.AnswersJson);

        foreach (var question in training.CustomQuestions.Where(q => q.IsRequired))
        {
            var hasAnswer = answers.Any(a => a.TrainingQuestionId == question.Id && !string.IsNullOrWhiteSpace(a.Value));
            if (!hasAnswer)
            {
                throw new DomainValidationException($"La question « {question.Prompt} » est obligatoire.");
            }
        }

        await using var cvStream = form.Cv.OpenReadStream();
        var cvUrl = await _fileStorage.SaveAsync(cvStream, form.Cv.FileName, "cvs", cancellationToken);

        var fileNumber = await GenerateUniqueFileNumberAsync(cancellationToken);

        var application = new Application
        {
            TrainingId = training.Id,
            LastName = form.LastName.Trim(),
            FirstName = form.FirstName.Trim(),
            Email = form.Email.Trim(),
            Phone = form.Phone.Trim(),
            City = form.City,
            Country = form.Country,
            GenderId = form.GenderId,
            DateOfBirth = form.DateOfBirth,
            EducationLevelId = form.EducationLevelId,
            SchoolOrUniversity = form.SchoolOrUniversity,
            GraduationYear = form.GraduationYear,
            Specialization = form.Specialization,
            CurrentOccupation = form.CurrentOccupation,
            CvUrl = cvUrl,
            PortfolioUrl = form.PortfolioUrl,
            HasPersonalComputer = form.HasPersonalComputer,
            CoverLetter = form.CoverLetter,
            OdcDiscoverySourceId = form.OdcDiscoverySourceId,
            FileNumber = fileNumber,
        };

        foreach (var answer in answers)
        {
            var belongsToTraining = training.CustomQuestions.Any(q => q.Id == answer.TrainingQuestionId);
            if (!belongsToTraining)
            {
                continue; // ignore answers to questions that don't belong to this training (e.g., if the form was tampered with)
            }

            application.Answers.Add(new ApplicationAnswer
            {
                TrainingQuestionId = answer.TrainingQuestionId,
                Value = answer.Value,
            });
        }

        _context.Applications.Add(application);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(application.Id, cancellationToken)
            ?? throw new InvalidOperationException("La candidature vient d'être créée mais n'a pas pu être relue.");
    }

    public async Task<PagedResult<ApplicationListItemResponse>> GetListAsync(
        Guid? trainingId, ApplicationStatus? status, string? search, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var query = _context.Applications.Include(a => a.Training).AsQueryable();

        if (trainingId.HasValue)
        {
            query = query.Where(a => a.TrainingId == trainingId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(a => EF.Functions.ILike(a.LastName, pattern)
                || EF.Functions.ILike(a.FirstName, pattern)
                || EF.Functions.ILike(a.Email, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.ApplicationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ApplicationListItemResponse(
                a.Id,
                a.FirstName + " " + a.LastName,
                a.Email,
                a.Phone,
                a.TrainingId,
                a.Training.Title,
                a.ApplicationDate,
                a.Status
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<ApplicationListItemResponse>(items, totalCount, page, pageSize);
    }

    public async Task<ApplicationDetailResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await _context.Applications
            .Include(a => a.Training)
            .Include(a => a.Gender)
            .Include(a => a.EducationLevel)
            .Include(a => a.OdcDiscoverySource)
            .Include(a => a.Answers).ThenInclude(ans => ans.TrainingQuestion)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

        return application is null ? null : MapToDetail(application);
    }

    public async Task MoveToInterviewAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await LoadForStatusChangeAsync(id, cancellationToken);
        application.Status = ApplicationStatus.IN_INTERVIEW;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkEvaluatedAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await LoadForStatusChangeAsync(id, cancellationToken);
        application.Status = ApplicationStatus.EVALUATED;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SelectAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await _context.Applications
            .Include(a => a.Training)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Candidature introuvable.");

        if (application.Status == ApplicationStatus.SELECTED)
        {
            return; // already selected, no action needed
        }

        if (application.Status == ApplicationStatus.REJECTED)
        {
            throw new DomainConflictException("Impossible de sélectionner une candidature déjà refusée.");
        }

        var selectedCount = await _context.Applications.CountAsync(
            a => a.TrainingId == application.TrainingId && a.Status == ApplicationStatus.SELECTED, cancellationToken);

        if (selectedCount >= application.Training.MaxCapacity)
        {
            throw new DomainConflictException("La capacité maximale de cette formation est atteinte.");
        }

        application.Status = ApplicationStatus.SELECTED;

        var participantExists = await _context.Participants.AnyAsync(p => p.ApplicationId == application.Id, cancellationToken);
        if (!participantExists)
        {
            _context.Participants.Add(new Participant { ApplicationId = application.Id });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BulkSelectAsync(List<Guid> applicationIds, CancellationToken cancellationToken)
    {
        foreach (var id in applicationIds)
        {
            await SelectAsync(id, cancellationToken);
        }
    }

    public async Task RejectAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await LoadForStatusChangeAsync(id, cancellationToken);
        application.Status = ApplicationStatus.REJECTED;
        application.ScheduledPurgeDate = DateTimeOffset.UtcNow.AddDays(GdprPurgeDelayDays);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // help

    private async Task<Application> LoadForStatusChangeAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await _context.Applications.SingleOrDefaultAsync(a => a.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Candidature introuvable.");

        if (application.Status is ApplicationStatus.SELECTED or ApplicationStatus.REJECTED)
        {
            throw new DomainConflictException("Cette candidature est déjà finalisée (sélectionnée ou refusée).");
        }

        return application;
    }

    private static ApplicationDetailResponse MapToDetail(Application a) => new(
        a.Id,
        a.TrainingId,
        a.Training.Title,
        a.LastName,
        a.FirstName,
        a.Email,
        a.Phone,
        a.City,
        a.Country,
        a.Gender?.Label,
        a.DateOfBirth,
        a.EducationLevel?.Label,
        a.SchoolOrUniversity,
        a.GraduationYear,
        a.Specialization,
        a.CurrentOccupation,
        a.CvUrl,
        a.PortfolioUrl,
        a.HasPersonalComputer,
        a.CoverLetter,
        a.OdcDiscoverySource?.Label,
        a.FileNumber,
        a.Status,
        a.ApplicationDate,
        a.Answers
            .Select(ans => new ApplicationAnswerResponse(ans.TrainingQuestionId, ans.TrainingQuestion.Prompt, ans.Value))
            .ToList()
    );

    private static List<AnswerInput> ParseAnswers(string? answersJson)
    {
        if (string.IsNullOrWhiteSpace(answersJson))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<AnswerInput>>(
                answersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        }
        catch (JsonException)
        {
            throw new DomainValidationException("Le format des réponses aux questions personnalisées est invalide.");
        }
    }

    private async Task<string> GenerateUniqueFileNumberAsync(CancellationToken cancellationToken)
    {
        string candidate;
        do
        {
            var randomDigits = RandomNumberGenerator.GetInt32(100000, 999999);
            candidate = $"CERT-{DateTime.UtcNow:yyyy}-{randomDigits}";
        }
        while (await _context.Applications.AnyAsync(a => a.FileNumber == candidate, cancellationToken));

        return candidate;
    }

    private sealed record AnswerInput(Guid TrainingQuestionId, string Value);
}
