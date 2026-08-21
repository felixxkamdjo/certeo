using System.Text.Json;
using Certeo.Api.Common;
using Certeo.Api.Infrastructure;
using Certeo.Api.Modules.Trainings.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Modules.Trainings;

public interface ITrainingService
{
    Task<PagedResult<TrainingListItemResponse>> GetListAsync(
        TrainingStatus? status, Guid? categoryId, string? search, int page, int pageSize, CancellationToken cancellationToken);

    Task<TrainingDetailResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<TrainingDetailResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<TrainingDetailResponse> CreateAsync(CreateTrainingRequest request, Guid currentUserId, CancellationToken cancellationToken);

    Task<TrainingDetailResponse> UpdateAsync(Guid id, UpdateTrainingRequest request, CancellationToken cancellationToken);

    Task PublishAsync(Guid id, CancellationToken cancellationToken);

    Task ArchiveAsync(Guid id, CancellationToken cancellationToken);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task UpdateApplicationFormAsync(Guid trainingId, ApplicationFormConfigRequest request, CancellationToken cancellationToken);
}

public sealed class TrainingService : ITrainingService
{
    private readonly CerteoDbContext _context;
    private readonly SlugGenerator _slugGenerator;

    public TrainingService(CerteoDbContext context, SlugGenerator slugGenerator)
    {
        _context = context;
        _slugGenerator = slugGenerator;
    }

    public async Task<PagedResult<TrainingListItemResponse>> GetListAsync(
        TrainingStatus? status, Guid? categoryId, string? search, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

        var query = _context.Trainings.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(t => EF.Functions.ILike(t.Title, pattern)
                || (t.Description != null && EF.Functions.ILike(t.Description, pattern)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TrainingListItemResponse(
                t.Id,
                t.Title,
                t.ImageUrl,
                t.Category.Label,
                t.StartDate,
                t.EndDate,
                t.MaxCapacity,
                t.Applications.Count,
                t.Applications.Count(a => a.Status == ApplicationStatus.SELECTED),
                t.Status
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<TrainingListItemResponse>(items, totalCount, page, pageSize);
    }

    public async Task<TrainingDetailResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var training = await LoadDetailQueryable()
            .SingleOrDefaultAsync(t => t.Id == id, cancellationToken);

        return training is null ? null : MapToDetail(training);
    }

    public async Task<TrainingDetailResponse?> GetPublicBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var visibleStatuses = new[] { TrainingStatus.PUBLISHED, TrainingStatus.IN_PROGRESS };

        var training = await LoadDetailQueryable()
            .SingleOrDefaultAsync(t => t.Slug == slug && visibleStatuses.Contains(t.Status), cancellationToken);

        return training is null ? null : MapToDetail(training);
    }

    public async Task<TrainingDetailResponse> CreateAsync(CreateTrainingRequest request, Guid currentUserId, CancellationToken cancellationToken)
    {
        ValidateDates(request.StartDate, request.EndDate, request.ApplicationDeadline);
        ValidateCapacity(request.MinCapacity, request.MaxCapacity);

        var categoryExists = await _context.ReferenceData
            .AnyAsync(r => r.Id == request.CategoryId && r.Type == ReferenceType.CATEGORY, cancellationToken);

        if (!categoryExists)
        {
            throw new DomainValidationException("La catégorie sélectionnée est invalide.");
        }

        var slug = await _slugGenerator.GenerateUniqueSlugAsync(request.Title, cancellationToken);

        var training = new Training
        {
            Title = request.Title,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            CategoryId = request.CategoryId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            ApplicationDeadline = request.ApplicationDeadline,
            Location = request.Location,
            Mode = request.Mode,
            MaxCapacity = request.MaxCapacity,
            MinCapacity = request.MinCapacity,
            TargetAudience = request.TargetAudience,
            SocialMediaMessage = request.SocialMediaMessage,
            PromotionalPosterUrl = request.PromotionalPosterUrl,
            IsQuizMandatory = request.IsQuizMandatory,
            IsCertificateEnabled = request.IsCertificateEnabled,
            Status = request.PublishImmediately ? TrainingStatus.PUBLISHED : TrainingStatus.DRAFT,
            Slug = slug,
            CreatedById = currentUserId,
        };

        // standard application fields - all are created by default, but LinkedIn URL is not required
        foreach (var field in Enum.GetValues<StandardApplicationField>())
        {
            training.ApplicationFields.Add(new TrainingApplicationField
            {
                Field = field,
                IsActive = true,
                IsRequired = field != StandardApplicationField.LINKEDIN_URL,
            });
        }

        _context.Trainings.Add(training);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(training.Id, cancellationToken)
            ?? throw new InvalidOperationException("La formation vient d'être créée mais n'a pas pu être relue.");
    }

    public async Task<TrainingDetailResponse> UpdateAsync(Guid id, UpdateTrainingRequest request, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings.SingleOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        if (training.Status == TrainingStatus.ARCHIVED)
        {
            throw new DomainConflictException("Une formation archivée ne peut plus être modifiée.");
        }

        ValidateDates(request.StartDate, request.EndDate, request.ApplicationDeadline);
        ValidateCapacity(request.MinCapacity, request.MaxCapacity);

        var categoryExists = await _context.ReferenceData
            .AnyAsync(r => r.Id == request.CategoryId && r.Type == ReferenceType.CATEGORY, cancellationToken);

        if (!categoryExists)
        {
            throw new DomainValidationException("La catégorie sélectionnée est invalide.");
        }

        // slug is generated only once at creation and never changes, so that public URLs never break even if the title changes.
        training.Title = request.Title;
        training.Description = request.Description;
        training.ImageUrl = request.ImageUrl;
        training.CategoryId = request.CategoryId;
        training.StartDate = request.StartDate;
        training.EndDate = request.EndDate;
        training.ApplicationDeadline = request.ApplicationDeadline;
        training.Location = request.Location;
        training.Mode = request.Mode;
        training.MaxCapacity = request.MaxCapacity;
        training.MinCapacity = request.MinCapacity;
        training.TargetAudience = request.TargetAudience;
        training.SocialMediaMessage = request.SocialMediaMessage;
        training.PromotionalPosterUrl = request.PromotionalPosterUrl;
        training.IsQuizMandatory = request.IsQuizMandatory;
        training.IsCertificateEnabled = request.IsCertificateEnabled;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken)
            ?? throw new InvalidOperationException("La formation vient d'être modifiée mais n'a pas pu être relue.");
    }

    public async Task PublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings.SingleOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        if (training.Status != TrainingStatus.DRAFT)
        {
            throw new DomainConflictException("Seule une formation en brouillon peut être publiée.");
        }

        training.Status = TrainingStatus.PUBLISHED;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ArchiveAsync(Guid id, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings.SingleOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        if (training.Status == TrainingStatus.ARCHIVED)
        {
            throw new DomainConflictException("Cette formation est déjà archivée.");
        }

        training.Status = TrainingStatus.ARCHIVED;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings
            .Include(t => t.Applications)
            .SingleOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        if (training.Applications.Count > 0)
        {
            throw new DomainConflictException(
                "Impossible de supprimer une formation qui a déjà reçu des candidatures. Archivez-la plutôt.");
        }

        _context.Trainings.Remove(training);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateApplicationFormAsync(Guid trainingId, ApplicationFormConfigRequest request, CancellationToken cancellationToken)
    {
        var training = await _context.Trainings
            .Include(t => t.ApplicationFields)
            .Include(t => t.CustomQuestions)
            .SingleOrDefaultAsync(t => t.Id == trainingId, cancellationToken)
            ?? throw new DomainNotFoundException("Formation introuvable.");

        // standard application fields - update existing or create new if missing (should not happen normally)
        foreach (var fieldConfig in request.StandardFields)
        {
            var existingField = training.ApplicationFields.SingleOrDefault(f => f.Field == fieldConfig.Field);

            if (existingField is null)
            {
                training.ApplicationFields.Add(new TrainingApplicationField
                {
                    TrainingId = trainingId,
                    Field = fieldConfig.Field,
                    IsActive = fieldConfig.IsActive,
                    IsRequired = fieldConfig.IsRequired,
                });
            }
            else
            {
                existingField.IsActive = fieldConfig.IsActive;
                existingField.IsRequired = fieldConfig.IsRequired;
            }
        }

        // custom questions - update existing, add new, remove deleted
        var incomingIds = request.CustomQuestions
            .Where(q => q.Id.HasValue)
            .Select(q => q.Id!.Value)
            .ToHashSet();

        var questionsToRemove = training.CustomQuestions
            .Where(q => !incomingIds.Contains(q.Id))
            .ToList();

        _context.TrainingQuestions.RemoveRange(questionsToRemove);

        foreach (var questionRequest in request.CustomQuestions)
        {
            var optionsJson = questionRequest.Options is { Count: > 0 }
                ? JsonSerializer.Serialize(questionRequest.Options)
                : null;

            var existingQuestion = questionRequest.Id.HasValue
                ? training.CustomQuestions.SingleOrDefault(q => q.Id == questionRequest.Id.Value)
                : null;

            if (existingQuestion is not null)
            {
                existingQuestion.Prompt = questionRequest.Prompt;
                existingQuestion.Type = questionRequest.Type;
                existingQuestion.OptionsJson = optionsJson;
                existingQuestion.IsRequired = questionRequest.IsRequired;
                existingQuestion.Order = questionRequest.Order;
            }
            else
            {
                training.CustomQuestions.Add(new TrainingQuestion
                {
                    TrainingId = trainingId,
                    Prompt = questionRequest.Prompt,
                    Type = questionRequest.Type,
                    OptionsJson = optionsJson,
                    IsRequired = questionRequest.IsRequired,
                    Order = questionRequest.Order,
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    // helper method to load the full entity with its relations 

    private IQueryable<Training> LoadDetailQueryable()
    {
        return _context.Trainings
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.ApplicationFields)
            .Include(t => t.CustomQuestions)
            .Include(t => t.Applications);
    }

    private static TrainingDetailResponse MapToDetail(Training t)
    {
        var applicationsCount = t.Applications.Count;
        var selectedCount = t.Applications.Count(a => a.Status == ApplicationStatus.SELECTED);
        var completionRate = applicationsCount == 0 ? 0 : (double)selectedCount / applicationsCount * 100;

        return new TrainingDetailResponse(
            t.Id,
            t.Title,
            t.Description,
            t.ImageUrl,
            t.CategoryId,
            t.Category.Label,
            t.StartDate,
            t.EndDate,
            t.ApplicationDeadline,
            t.Location,
            t.Mode,
            t.MaxCapacity,
            t.MinCapacity,
            t.TargetAudience,
            t.SocialMediaMessage,
            t.PromotionalPosterUrl,
            t.IsQuizMandatory,
            t.IsCertificateEnabled,
            t.Status,
            t.Slug,
            $"{t.CreatedBy.FirstName} {t.CreatedBy.LastName}",
            t.CreatedAt,
            applicationsCount,
            selectedCount,
            completionRate,
            t.ApplicationFields
                .Select(f => new ApplicationFieldConfigResponse(f.Field, f.IsActive, f.IsRequired))
                .ToList(),
            t.CustomQuestions
                .OrderBy(q => q.Order)
                .Select(q => new TrainingQuestionResponse(
                    q.Id,
                    q.Prompt,
                    q.Type,
                    q.OptionsJson == null ? null : JsonSerializer.Deserialize<List<string>>(q.OptionsJson),
                    q.IsRequired,
                    q.Order
                ))
                .ToList()
        );
    }

    private static void ValidateDates(DateOnly startDate, DateOnly endDate, DateOnly applicationDeadline)
    {
        if (endDate <= startDate)
        {
            throw new DomainValidationException("La date de fin doit être postérieure à la date de début.");
        }

        if (applicationDeadline >= startDate)
        {
            throw new DomainValidationException("La date limite d'inscription doit être antérieure à la date de début.");
        }
    }

    private static void ValidateCapacity(int minCapacity, int maxCapacity)
    {
        if (maxCapacity <= 0)
        {
            throw new DomainValidationException("La capacité maximale doit être supérieure à 0.");
        }

        if (minCapacity < 0 || minCapacity > maxCapacity)
        {
            throw new DomainValidationException("La capacité minimale est invalide par rapport à la capacité maximale.");
        }
    }
}
