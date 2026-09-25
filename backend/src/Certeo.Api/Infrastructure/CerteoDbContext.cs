using Certeo.Api.Modules.Applications;
using Certeo.Api.Modules.Certificates;
using Certeo.Api.Modules.Evaluations;
using Certeo.Api.Modules.Identity;
using Certeo.Api.Modules.MasterData;
using Certeo.Api.Modules.Participants;
using Certeo.Api.Modules.Settings;
using Certeo.Api.Modules.Trainings;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Infrastructure;

public sealed class CerteoDbContext : DbContext
{
    public CerteoDbContext(DbContextOptions<CerteoDbContext> options) : base(options) { }

    //  Identity 
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    //  Master Data 
    public DbSet<ReferenceData> ReferenceData => Set<ReferenceData>();

    //  Trainings 
    public DbSet<Training> Trainings => Set<Training>();
    public DbSet<TrainingApplicationField> TrainingApplicationFields => Set<TrainingApplicationField>();
    public DbSet<TrainingQuestion> TrainingQuestions => Set<TrainingQuestion>();

    //  Applications 
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationAnswer> ApplicationAnswers => Set<ApplicationAnswer>();

    //  Participants & Attendance 
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<AttendanceProfile> AttendanceProfiles => Set<AttendanceProfile>();
    public DbSet<CenterQrCode> CenterQrCodes => Set<CenterQrCode>();

    //  Evaluations 
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<EvaluationQuestion> EvaluationQuestions => Set<EvaluationQuestion>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<EvaluationAttempt> EvaluationAttempts => Set<EvaluationAttempt>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();

    //  Certificates 
    public DbSet<Certificate> Certificates => Set<Certificate>();

    //  Settings 
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //  IDENTITY 
        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(t => t.Token).IsUnique();
            e.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        //  MASTER DATA 
        modelBuilder.Entity<ReferenceData>(e =>
        {
            e.HasIndex(r => new { r.Type, r.Code }).IsUnique();
        });

        //  TRAININGS 
        modelBuilder.Entity<Training>(e =>
        {
            e.HasIndex(t => t.Slug).IsUnique();
            e.HasOne(t => t.Category)
                .WithMany()
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.CreatedBy)
                .WithMany()
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TrainingApplicationField>(e =>
        {
            e.HasIndex(f => new { f.TrainingId, f.Field }).IsUnique();
            e.HasOne(f => f.Training)
                .WithMany(t => t.ApplicationFields)
                .HasForeignKey(f => f.TrainingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TrainingQuestion>(e =>
        {
            e.HasOne(q => q.Training)
                .WithMany(t => t.CustomQuestions)
                .HasForeignKey(q => q.TrainingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        //  APPLICATIONS 
        modelBuilder.Entity<Application>(e =>
        {
            e.HasIndex(a => a.FileNumber).IsUnique();
            e.HasOne(a => a.Training)
                .WithMany(t => t.Applications)
                .HasForeignKey(a => a.TrainingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Gender)
                .WithMany()
                .HasForeignKey(a => a.GenderId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.EducationLevel)
                .WithMany()
                .HasForeignKey(a => a.EducationLevelId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.OdcDiscoverySource)
                .WithMany()
                .HasForeignKey(a => a.OdcDiscoverySourceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationAnswer>(e =>
        {
            e.HasOne(a => a.Application)
                .WithMany(app => app.Answers)
                .HasForeignKey(a => a.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.TrainingQuestion)
                .WithMany()
                .HasForeignKey(a => a.TrainingQuestionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        //  PARTICIPANTS & ATTENDANCE 
        modelBuilder.Entity<Participant>(e =>
        {
            e.HasIndex(p => p.ApplicationId).IsUnique();
            e.HasOne(p => p.Application)
                .WithOne(app => app.Participant)
                .HasForeignKey<Participant>(p => p.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Attendance>(e =>
        {
            e.HasOne(a => a.Participant)
                .WithMany(p => p.Attendances)
                .HasForeignKey(a => a.ParticipantId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(a => a.VisitReason)
                .WithMany()
                .HasForeignKey(a => a.VisitReasonId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.AgeRange)
                .WithMany()
                .HasForeignKey(a => a.AgeRangeId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(a => a.Training)
                .WithMany()
                .HasForeignKey(a => a.TrainingId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AttendanceProfile>(e =>
        {
            e.HasOne(ap => ap.Attendance)
                .WithMany(a => a.Profiles)
                .HasForeignKey(ap => ap.AttendanceId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ap => ap.Profile)
                .WithMany()
                .HasForeignKey(ap => ap.ProfileId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CenterQrCode>(e =>
        {
            e.HasIndex(q => q.Token).IsUnique();
        });

        //  EVALUATIONS 
        modelBuilder.Entity<Evaluation>(e =>
        {
            e.HasIndex(ev => ev.TrainingId).IsUnique();
            e.HasOne(ev => ev.Training)
                .WithOne(t => t.Evaluation)
                .HasForeignKey<Evaluation>(ev => ev.TrainingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EvaluationQuestion>(e =>
        {
            e.HasOne(q => q.Evaluation)
                .WithMany(ev => ev.Questions)
                .HasForeignKey(q => q.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionOption>(e =>
        {
            e.HasOne(o => o.EvaluationQuestion)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.EvaluationQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EvaluationAttempt>(e =>
        {
            e.HasOne(t => t.Evaluation)
                .WithMany(ev => ev.Attempts)
                .HasForeignKey(t => t.EvaluationId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Participant)
                .WithMany()
                .HasForeignKey(t => t.ParticipantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AttemptAnswer>(e =>
        {
            e.HasOne(a => a.EvaluationAttempt)
                .WithMany(ea => ea.Answers)
                .HasForeignKey(a => a.EvaluationAttemptId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.EvaluationQuestion)
                .WithMany()
                .HasForeignKey(a => a.EvaluationQuestionId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.SelectedOption)
                .WithMany()
                .HasForeignKey(a => a.SelectedOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        //  CERTIFICATES 
        modelBuilder.Entity<Certificate>(e =>
        {
            e.HasIndex(c => c.VerificationCode).IsUnique();
            e.HasOne(c => c.Participant)
                .WithMany()
                .HasForeignKey(c => c.ParticipantId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(c => c.Training)
                .WithMany()
                .HasForeignKey(c => c.TrainingId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.EvaluationAttempt)
                .WithMany()
                .HasForeignKey(c => c.EvaluationAttemptId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}